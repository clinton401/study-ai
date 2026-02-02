"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { 
  countAiQuestionsDailyUsage, 
  createAiQuestionsUsage 
} from "@/data/ai-questions-usage";
import { createUserQuestions } from "@/data/user-questions";
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
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

const questionError = (error: string): GenerateQuestionsResult => 
  errorResponse(error, { questions: null });

/**
 * Validate question structure
 */
function validateQuestions(data: any): data is Question[] {
  if (!Array.isArray(data)) return false;

  return data.every((q, index) =>
    typeof q.id === "number" &&
    q.id === index + 1 &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((opt: string) => typeof opt === "string") &&
    typeof q.correctAnswer === "number" &&
    q.correctAnswer >= 0 &&
    q.correctAnswer < q.options.length
  );
}

/**
 * Build questions generation prompt
 */
function buildQuestionsPrompt(text: string, count: number): string {
  return `Generate exactly ${count} multiple-choice practice questions from the following text.

Output must be valid JSON only, in the following format:
[
  {
    "id": 1,
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "question": "Another question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]

Important Rules:
- "id" starts at 1 and increments by 1 for each question.
- "question" must be a clear question string.
- "options" must always contain exactly 4 unique strings.
- "correctAnswer" must be the ZERO-BASED index (0–3) of the correct option in the "options" array.
- Do NOT include explanations, introductions, comments, or code fences.
- ONLY return valid JSON.
- Questions generated should be diverse and random

Text to generate from:
${text}
`;
}

/**
 * Parse and validate questions from AI response
 */
function parseQuestions(responseText: string): Question[] | null {
  try {
    const cleanText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const questions = JSON.parse(cleanText);

    if (!validateQuestions(questions)) {
      console.error("Question validation failed:", questions);
      return null;
    }

    return questions;
  } catch (err) {
    console.error("Failed to parse questions JSON:", err);
    return null;
  }
}

/**
 * Generate practice questions from text using AI
 * 
 * @param text - Text to generate questions from (200-700,000 characters)
 * @param count - Number of questions to generate (default: 25)
 * @returns Array of questions or error
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
    const { error: rateLimitError } = await rateLimit(userId, {
      windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
      maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
      lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
    }, true, "QUESTIONS");

    if (rateLimitError) {
      return questionError(rateLimitError);
    }

    // Input validation
    const trimmedText = text.trim();

    if (trimmedText.length < VALIDATION.MIN_LENGTH) {
      return questionError(
        `Please provide at least ${VALIDATION.MIN_LENGTH} characters of text to generate questions.`
      );
    }

    if (text.length > VALIDATION.MAX_LENGTH) {
      return questionError(
        `Text must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
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

    // Generate questions using Vercel AI SDK v4
    const { text: generatedText } = await generateText({
      model: openrouter(getModelForFeature('QUESTIONS')),
      prompt: buildQuestionsPrompt(text, count),
      temperature: 0.7,
      topP: 0.9,
    });

    // Parse and validate questions
    const questions = parseQuestions(generatedText);

    if (!questions) {
      return questionError("Invalid question format returned from AI");
    }

    // Prepare data for storage
    const questionsData = {
      userId,
      questions,
      originalText: text,
      count,
    };

    // Parallel operations: record usage and save questions
    const promises = [
      createAiQuestionsUsage(userId),
      session ? createUserQuestions(questionsData) : null,
    ].filter(Boolean);

    await Promise.all(promises);

    return { error: null, questions };

  } catch (err) {
    console.error("Question generation error:", err);
    return questionError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}