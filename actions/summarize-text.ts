"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { 
  countAiSummaryDailyUsage, 
  createAiSummaryUsage 
} from "@/data/ai-summary-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse, generateTitleFromText } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { createUserSummary } from "@/data/user-summary";
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
type SummaryLength = "short" | "medium" | "long";

interface SummaryResult {
  summary: string | null;
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

const summaryError = (error: string): SummaryResult =>
  errorResponse(error, { summary: null });

/**
 * Length-specific summarization strategies
 * Optimized for clarity and appropriate detail level
 */
const SUMMARY_STRATEGIES: Record<SummaryLength, {
  maxTokens: number;
  instructions: string;
}> = {
  short: {
    maxTokens: 512,
    instructions: 
      "Extract only the most critical information. " +
      "Focus on essential facts, key decisions, and core concepts. " +
      "Eliminate redundancy and supporting details. " +
      "Use concise, direct language. " +
      "Aim for 150-250 words maximum.",
  },
  
  medium: {
    maxTokens: 1024,
    instructions: 
      "Create a balanced summary capturing all main points. " +
      "Include primary arguments, key evidence, and important context. " +
      "Maintain logical flow and clear transitions. " +
      "Use accessible language. " +
      "Aim for 300-500 words.",
  },
  
  long: {
    maxTokens: 2048,
    instructions: 
      "Provide comprehensive coverage preserving nuance and scope. " +
      "Include all main arguments, supporting evidence, and examples. " +
      "Maintain logical structure and concept relationships. " +
      "Address different perspectives and conclusions. " +
      "Organize with clear themes. " +
      "Aim for 600-1000 words.",
  },
};

/**
 * Build optimized summarization prompt
 */
function buildSummaryPrompt(text: string, length: SummaryLength): string {
  const strategy = SUMMARY_STRATEGIES[length];
  
  return `Summarize the following text with a ${length} summary.

${strategy.instructions}

CRITICAL RULES:
- Output ONLY the summary text
- Use plain markdown formatting (headings, bold, lists)
- NO code fences or markdown declarations
- NO quotes around the output
- NO introductions or meta-commentary
- Maintain accuracy to the source material

Text to summarize:
${text}`;
}

/**
 * Clean AI output by removing markdown artifacts
 */
function cleanSummaryOutput(text: string): string {
  return text
    .replace(/```markdown/gi, "")
    .replace(/```/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/**
 * Summarize text at specified length using AI
 * 
 * @param text - Text to summarize (200-700,000 characters)
 * @param length - Desired summary length
 * @returns Summary text or error
 */
export async function summarizeText(
  text: string,
  length: SummaryLength = "medium"
): Promise<SummaryResult> {
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
      return summaryError(rateLimitError);
    }

    // Input validation
    const trimmedText = text.trim();

    if (trimmedText.length < VALIDATION.MIN_LENGTH) {
      return summaryError(
        `Please enter more text to summarize (at least ${VALIDATION.MIN_LENGTH} characters).`
      );
    }

    if (text.length > VALIDATION.MAX_LENGTH) {
      return summaryError(
        `Text to be summarized must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check daily usage limit
    const usageCount = await countAiSummaryDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest
      ? VALIDATION.DAILY_LIMITS.GUEST
      : VALIDATION.DAILY_LIMITS.USER;

    if (usageCount >= limit) {
      const message = isGuest
        ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more summary generations!`
        : `Daily AI summary generation limit reached (${limit}/${limit}).`;

      return summaryError(message);
    }

    // Generate summary using Vercel AI SDK v4
    // const strategy = SUMMARY_STRATEGIES[length];
    
    const { text: generatedText } = await generateText({
      model: openrouter(getModelForFeature('SUMMARY')),
      prompt: buildSummaryPrompt(text, length),
      temperature: 0.7,
      topP: 0.9,
    });

    // Validate and clean output
    if (!generatedText?.trim()) {
      return summaryError("Failed to generate summary.");
    }

    const cleanedSummary = cleanSummaryOutput(generatedText);

    // Prepare data for storage
    const summaryData = {
      userId,
      summary: cleanedSummary,
      originalText: text,
      length,
      title: generateTitleFromText(cleanedSummary),
    };

    // Parallel operations: record usage and save summary
    const promises = [
      createAiSummaryUsage(userId),
      session ? createUserSummary(summaryData) : null,
    ].filter(Boolean);

    await Promise.all(promises);

    return { error: null, summary: cleanedSummary };

  } catch (err) {
    console.error("Summary generation error:", err);

    const errorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    return summaryError(errorMessage);
  }
}