"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {
    countAiRephraseDailyUsage,
    createAiRephraseUsage
} from "@/data/ai-rephrase-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { generateText } from 'ai';
import { openrouter, getModelForFeature, DEFAULT_GENERATION_CONFIG } from "@/lib/ai-client";

// Type definitions
type ToneType = "formal" | "friendly" | "academic" | "casual";

interface RephraseResult {
    rephrase: string | null;
    error: string | null;
}

// Constants
const VALIDATION = {
    MIN_LENGTH: 100,
    MAX_LENGTH: 50_000,
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

/**
 * Tone-specific instructions for natural rephrasing
 */
const TONE_INSTRUCTIONS: Record<ToneType, string> = {
    formal:
        "Use professional vocabulary and complete sentences. " +
        "Maintain dignity and respect. Avoid contractions. " +
        "Structure sentences clearly with proper grammar.",

    friendly:
        "Use warm, conversational language. " +
        "Include contractions where natural. " +
        "Write as if speaking to a friend, maintaining positivity.",

    academic:
        "Use scholarly language with precise terminology. " +
        "Employ complex sentence structures where appropriate. " +
        "Maintain objectivity and analytical tone.",

    casual:
        "Use everyday language and relaxed phrasing. " +
        "Include contractions freely. " +
        "Write naturally without stiffness.",
} as const;

const rephraseError = (error: string): RephraseResult =>
    errorResponse(error, { rephrase: null });

/**
 * Build optimized prompt for rephrasing
 */
function buildRephrasePrompt(text: string, tone: ToneType): string {
    return `Rewrite the following text in a ${tone} tone. ${TONE_INSTRUCTIONS[tone]}

CRITICAL RULES:
- Fix all grammatical errors
- Use simple, clear English suitable for beginners
- Maintain the original meaning
- Output ONLY the rewritten text
- NO explanations, preambles, or markdown formatting
- NO quotes or code blocks around the output

Text to rewrite:
${text}`;
}

/**
 * Rephrase text with specified tone using AI
 * 
 * @param text - Text to rephrase (100-50,000 characters)
 * @param tone - Desired tone for output
 * @returns Rephrased text or error
 */
export async function rephraseText(
    text: string,
    tone: ToneType
): Promise<RephraseResult> {
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
            return rephraseError(rateLimitError);
        }

        // Input validation
        const trimmedText = text.trim();

        if (trimmedText.length < VALIDATION.MIN_LENGTH) {
            return rephraseError(
                `Please enter more text to rephrase (at least ${VALIDATION.MIN_LENGTH} characters).`
            );
        }

        if (text.length > VALIDATION.MAX_LENGTH) {
            return rephraseError(
                `Text to be rephrased must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
            );
        }

        // Connect to database
        await connectToDatabase();

        // Check daily usage limit
        const usageCount = await countAiRephraseDailyUsage(userId);
        const isGuest = !session;
        const limit = isGuest
            ? VALIDATION.DAILY_LIMITS.GUEST
            : VALIDATION.DAILY_LIMITS.USER;

        if (usageCount >= limit) {
            const message = isGuest
                ? `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more rephrase generations!`
                : `Daily AI rephrase generation limit reached (${limit}/${limit}).`;

            return rephraseError(message);
        }

        // Generate rephrased text using Vercel AI SDK v4
        const { text: generatedText } = await generateText({
            model: openrouter(getModelForFeature('REPHRASE')),
            prompt: buildRephrasePrompt(text, tone),
            temperature: DEFAULT_GENERATION_CONFIG.temperature,
            topP: DEFAULT_GENERATION_CONFIG.topP
        });

        // Validate AI output
        if (!generatedText?.trim()) {
            return rephraseError("Failed to rephrase text. Please try again.");
        }

        // Record usage (fire-and-forget)
        createAiRephraseUsage(userId).catch(err =>
            console.error("Failed to record usage:", err)
        );

        return {
            rephrase: generatedText.trim(),
            error: null
        };

    } catch (err) {
        console.error("Rephrase error:", err);

        const errorMessage = err instanceof Error
            ? err.message
            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

        return rephraseError(errorMessage);
    }
}