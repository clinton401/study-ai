"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import {
  countAiQuestionsDailyUsage,
  createAiQuestionsUsage,
} from "@/data/ai-questions-usage";
import { createUserQuestions } from "@/data/user-questions";
import { generateObject } from "ai";
import { openrouter, getModelForFeature } from "@/lib/ai-client";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GenerateQuestionsResult {
  questions: Question[] | null;
  error: string | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.number().int().positive().describe(
        "Sequential ID starting at 1, incrementing by 1 for each question."
      ),
      question: z.string().min(1).describe(
        "A clear, unambiguous question about the source material."
      ),
      options: z.array(z.string().min(1)).length(4).describe(
        "Exactly 4 unique answer options."
      ),
      correctAnswer: z.number().int().min(0).max(3).describe(
        "Zero-based index (0–3) of the correct option in the options array."
      ),
    })
  ).describe("Array of multiple-choice questions generated from the source text."),
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

const questionError = (error: string): GenerateQuestionsResult =>
  errorResponse(error, { questions: null });

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildQuestionsPrompt(text: string, count: number): string {
  return `Generate exactly ${count} multiple-choice practice questions from the text below.

Rules:
- Each question must have exactly 4 unique answer options
- "correctAnswer" is the zero-based index (0, 1, 2, or 3) of the correct option
- Questions must be clear and unambiguous
- Distribute questions across different parts of the text — no clustering
- Vary the difficulty: mix straightforward recall with conceptual understanding
- Plausible distractors only — no obviously wrong options
- IDs start at 1 and increment by 1

Source text:
"""
${text}
"""`;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Generate practice questions from text using AI with structured output.
 *
 * Uses generateObject + Zod schema — typed response, zero JSON parsing,
 * schema-enforced option count and correctAnswer bounds.
 *
 * @param text  - Source text (200–700,000 characters)
 * @param count - Number of questions to generate (default: 25)
 */
export async function generateQuestions(
  text: string,
  count: number = 25
): Promise<GenerateQuestionsResult> {
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
      "QUESTIONS"
    );

    if (rateLimitError) return questionError(rateLimitError);

    // Input validation
    const trimmedText = text.trim();

    if (trimmedText.length < VALIDATION.MIN_LENGTH) {
      return questionError(
        `Please provide at least ${VALIDATION.MIN_LENGTH} characters of text to generate questions.`
      );
    }

    if (text.length > VALIDATION.MAX_LENGTH) {
      return questionError(
        `Text must have a maximum of ${VALIDATION.MAX_LENGTH.toLocaleString()} characters.`
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check daily usage limit
    const usageCount = await countAiQuestionsDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest
      ? VALIDATION.DAILY_LIMITS.GUEST
      : VALIDATION.DAILY_LIMITS.USER;

    if (usageCount >= limit) {
      const message = isGuest
        ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more question generations!`
        : `Daily AI question generation limit reached (${limit}/${limit}).`;
      return questionError(message);
    }

    // ── generateObject replaces generateText + parseQuestions ────────────────
    const { object } = await generateObject({
      model: openrouter(getModelForFeature("QUESTIONS")),
      schema: questionsSchema,
      prompt: buildQuestionsPrompt(text, count),
      temperature: 0.7,
      topP: 0.9,
    });

    const questions = object.questions;

    if (!questions.length) {
      return questionError("No questions were generated. Please try again.");
    }

    // Normalise IDs and trim strings in case of model drift
    const normalised: Question[] = questions.map((q, i) => ({
      id: i + 1,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: q.correctAnswer,
    }));

    // Parallel: record usage + persist (guests skip persistence)
    await Promise.all(
      [
        createAiQuestionsUsage(userId),
        session
          ? createUserQuestions({ userId, questions: normalised, originalText: text, count })
          : null,
      ].filter(Boolean)
    );

    return { error: null, questions: normalised };

  } catch (err) {
    console.error("Question generation error:", err);
    return questionError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}