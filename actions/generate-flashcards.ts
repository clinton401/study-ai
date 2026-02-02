"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { 
  countFlashcardsDailyUsage, 
  createFlashcardsUsage 
} from "@/data/flashcards-usage";
import { createUserFlashcards } from "@/data/user-flashcards";
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface GenerateFlashcardsResult {
  flashcards: Flashcard[] | null;
  error: string | null;
}

// Constants
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

/**
 * Validate flashcard structure
 */
function validateFlashcards(data: any): data is Flashcard[] {
  if (!Array.isArray(data)) return false;

  return data.every((fc, index) =>
    typeof fc.id === "number" &&
    fc.id === index + 1 &&
    typeof fc.front === "string" &&
    fc.front.trim().length > 0 &&
    typeof fc.back === "string" &&
    fc.back.trim().length > 0
  );
}

/**
 * Build flashcard generation prompt
 */
function buildFlashcardsPrompt(text: string, count: number): string {
  return `Generate exactly ${count} flashcards from the following text.

Output must be valid JSON only, in the following format:
[
  {
    "id": 1,
    "front": "What is photosynthesis?",
    "back": "The process by which plants convert sunlight into energy"
  },
  {
    "id": 2,
    "front": "Question or concept here?",
    "back": "Clear, concise answer here"
  }
]

Important Rules:
- "id" starts at 1 and increments by 1 for each flashcard.
- "front" must always contain the question or prompt (short and clear).
- "back" must always contain the correct answer or explanation.
- Do NOT include explanations, introductions, comments, or code fences.
- ONLY return valid JSON.
- Flashcards should be diverse and useful for studying.

Text to generate from:
${text}
`;
}

/**
 * Parse and validate flashcards from AI response
 */
function parseFlashcards(responseText: string): Flashcard[] | null {
  try {
    const cleanText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const flashcards = JSON.parse(cleanText);

    if (!validateFlashcards(flashcards)) {
      console.error("Flashcard validation failed:", flashcards);
      return null;
    }

    return flashcards;
  } catch (err) {
    console.error("Failed to parse flashcards JSON:", err);
    return null;
  }
}

/**
 * Generate flashcards from text using AI
 * 
 * @param text - Text to generate flashcards from (200-700,000 characters)
 * @param count - Number of flashcards to generate (default: 20)
 * @returns Array of flashcards or error
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
    const { error: rateLimitError } = rateLimit(userId, true, {
      windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
      maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
      lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
    });

    if (rateLimitError) {
      return flashcardError(rateLimitError);
    }

    // Input validation
    const trimmedText = text.trim();

    if (trimmedText.length < VALIDATION.MIN_LENGTH) {
      return flashcardError(
        `Please provide at least ${VALIDATION.MIN_LENGTH} characters of text to generate flashcards.`
      );
    }

    if (text.length > VALIDATION.MAX_LENGTH) {
      return flashcardError(
        `Text must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
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

    // Generate flashcards using Vercel AI SDK v4
    const { text: generatedText } = await generateText({
      model: openrouter(getModelForFeature('FLASHCARDS')),
      prompt: buildFlashcardsPrompt(text, count),
      temperature: 0.7,
      topP: 0.9,
    });

    // Parse and validate flashcards
    const flashcards = parseFlashcards(generatedText);

    if (!flashcards) {
      return flashcardError("Invalid flashcard format returned from AI");
    }

    // Prepare data for storage
    const flashcardsData = {
      userId,
      flashcards,
      originalText: text,
      count,
    };

    // Parallel operations: record usage and save flashcards
    const promises = [
      createFlashcardsUsage(userId),
      session ? createUserFlashcards(flashcardsData) : null,
    ].filter(Boolean);

    await Promise.all(promises);

    return { error: null, flashcards };

  } catch (err) {
    console.error("Flashcard generation error:", err);
    return flashcardError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}