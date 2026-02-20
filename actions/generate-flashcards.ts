"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import {
  countFlashcardsDailyUsage,
  createFlashcardsUsage,
} from "@/data/flashcards-usage";
import { createUserFlashcards } from "@/data/user-flashcards";
import { generateObject } from "ai";
import { openrouter, getModelForFeature } from "@/lib/ai-client";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface GenerateFlashcardsResult {
  flashcards: Flashcard[] | null;
  error: string | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      id: z.number().int().positive().describe(
        "Sequential ID starting at 1, incrementing by 1 for each card."
      ),
      front: z.string().min(1).describe(
        "The question or concept prompt — short and clear."
      ),
      back: z.string().min(1).describe(
        "The correct answer or explanation for the front."
      ),
    })
  ).describe("Array of flashcards generated from the source text."),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
  MIN_LENGTH: 200,
  MAX_LENGTH: 700_000,
  RATE_LIMIT: {
    WINDOW_MS: 2 * 60 * 1000,
    MAX_REQUESTS: 5,
    LOCKOUT_MS: 2 * 60 * 1000,
  },
  DAILY_LIMITS: {
    GUEST: 4,
    USER: 10,
  },
} as const;

const flashcardError = (error: string): GenerateFlashcardsResult =>
  errorResponse(error, { flashcards: null });

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildFlashcardsPrompt(text: string, count: number): string {
  return `Generate exactly ${count} flashcards from the text below.

Rules:
- "front" must be a question or concept prompt — keep it short and clear
- "back" must be the correct answer or explanation
- IDs start at 1 and increment by 1
- Cards must be diverse and genuinely useful for studying the material
- Cover different parts of the text — do not cluster around one section

Source text:
"""
${text}
"""`;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Generate flashcards from text using AI with structured output.
 *
 * Uses generateObject + Zod schema — typed response, zero JSON parsing,
 * no regex cleanup, no manual validation.
 *
 * @param text  - Source text (200–700,000 characters)
 * @param count - Number of flashcards to generate (default: 20)
 */
export async function generateFlashcards(
  text: string,
  count: number = 20
): Promise<GenerateFlashcardsResult> {
  try {
    // Parallel auth checks
    const [session, guestId] = await Promise.all([
      getServerUser(),
      getOrCreateGuestId(),
    ]);

    const userId = session?.id ?? guestId;

    // Rate limiting
    const { error: rateLimitError } = await rateLimit(
      userId,
      {
        windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
        maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
        lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
      },
      true,
      "FLASHCARDS"
    );

    if (rateLimitError) return flashcardError(rateLimitError);

    // Input validation
    const trimmedText = text.trim();

    if (trimmedText.length < VALIDATION.MIN_LENGTH) {
      return flashcardError(
        `Please provide at least ${VALIDATION.MIN_LENGTH} characters of text to generate flashcards.`
      );
    }

    if (text.length > VALIDATION.MAX_LENGTH) {
      return flashcardError(
        `Text must have a maximum of ${VALIDATION.MAX_LENGTH.toLocaleString()} characters.`
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check daily usage limit
    const usageCount = await countFlashcardsDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest
      ? VALIDATION.DAILY_LIMITS.GUEST
      : VALIDATION.DAILY_LIMITS.USER;

    if (usageCount >= limit) {
      const message = isGuest
        ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more flashcard generations!`
        : `Daily AI flashcard generation limit reached (${limit}/${limit}).`;
      return flashcardError(message);
    }

    // ── generateObject replaces generateText + parseFlashcards ───────────────
    const { object } = await generateObject({
      model: openrouter(getModelForFeature("FLASHCARDS")),
      schema: flashcardsSchema,
      prompt: buildFlashcardsPrompt(text, count),
      temperature: 0.7,
      topP: 0.9,
    });

    const flashcards = object.flashcards;

    if (!flashcards.length) {
      return flashcardError("No flashcards were generated. Please try again.");
    }

    // Normalise IDs in case the model drifts (1-based, sequential)
    const normalised: Flashcard[] = flashcards.map((fc, i) => ({
      id: i + 1,
      front: fc.front.trim(),
      back: fc.back.trim(),
    }));

    // Parallel: record usage + persist (guests skip persistence)
    await Promise.all(
      [
        createFlashcardsUsage(userId),
        session
          ? createUserFlashcards({ userId, flashcards: normalised, originalText: text, count })
          : null,
      ].filter(Boolean)
    );

    return { error: null, flashcards: normalised };

  } catch (err) {
    console.error("Flashcard generation error:", err);
    return flashcardError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}