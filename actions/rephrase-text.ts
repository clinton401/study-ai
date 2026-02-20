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

// ─── Types ────────────────────────────────────────────────────────────────────

type ToneType = "formal" | "friendly" | "academic" | "casual";

interface RephraseResult {
    rephrase: string | null;
    error: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Tone instructions ────────────────────────────────────────────────────────

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

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildRephrasePrompt(text: string, tone: ToneType): string {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    return `Rewrite the following text in a ${tone} tone. ${TONE_INSTRUCTIONS[tone]}

CRITICAL RULES:
- Rewrite EVERY sentence — do not skip, summarise, merge, or drop any part of the original
- Every idea, point, and detail from the input must appear in the output, in the same order
- Target approximately ${wordCount} words — do not produce significantly fewer words than the original
- Fix all grammatical errors as you rewrite
- Use simple, clear English suitable for beginners
- Do NOT stop early — rewrite the entire input before ending your response
- Output ONLY the rewritten text — no labels, no preamble, no "Here is the rewrite:"
- NO markdown formatting, quotes, or code blocks

Text to rewrite:
${text}`;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Rephrase text with specified tone using AI.
 *
 * generateText is intentionally used here (not generateObject) — rephrasing
 * produces freeform prose, not structured data, so a Zod schema adds no value.
 *
 * @param text - Text to rephrase (100–50,000 characters)
 * @param tone - Desired tone for output
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
        const { error: rateLimitError } = await rateLimit(userId, {
            windowSize: VALIDATION.RATE_LIMIT.WINDOW_MS,
            maxRequests: VALIDATION.RATE_LIMIT.MAX_REQUESTS,
            lockoutPeriod: VALIDATION.RATE_LIMIT.LOCKOUT_MS,
        }, true, "REPHRASE");

        if (rateLimitError) return rephraseError(rateLimitError);

        // Input validation
        const trimmedText = text.trim();

        if (trimmedText.length < VALIDATION.MIN_LENGTH) {
            return rephraseError(
                `Please enter more text to rephrase (at least ${VALIDATION.MIN_LENGTH} characters).`
            );
        }

        if (text.length > VALIDATION.MAX_LENGTH) {
            return rephraseError(
                `Text to be rephrased must have a maximum of ${VALIDATION.MAX_LENGTH.toLocaleString()} characters.`
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

        // Generate rephrased text
        const { text: generatedText } = await generateText({
            model: openrouter(getModelForFeature('REPHRASE')),
            prompt: buildRephrasePrompt(text, tone),
            temperature: DEFAULT_GENERATION_CONFIG.temperature,
            topP: DEFAULT_GENERATION_CONFIG.topP,
        });

        if (!generatedText?.trim()) {
            return rephraseError("Failed to rephrase text. Please try again.");
        }

        // Record usage (fire-and-forget)
        createAiRephraseUsage(userId).catch((err) =>
            console.error("Failed to record rephrase usage:", err)
        );

        return { rephrase: generatedText.trim(), error: null };

    } catch (err) {
        console.error("Rephrase error:", err);
        return rephraseError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}