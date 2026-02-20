"use server";

import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {
    countAiFixGrammarDailyUsage,
    createAiFixGrammarUsage,
} from "@/data/ai-fix-grammar-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { generateObject } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GrammarFixResult {
    grammarFixes: string[];
    error: string | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

/**
 * Zod schema passed directly to generateObject.
 * The AI SDK enforces this at the model level — no manual parsing needed.
 * Each fix is a single human-readable string in the format:
 * "Error Type: [original] → [correction]"
 */
const grammarSchema = z.object({
    hasErrors: z.boolean().describe(
        "True if any grammar, spelling, punctuation, or style errors were found. False if the text is clean."
    ),
    fixes: z.array(
        z.string().describe(
            'A single error in the format: "Error Type: [original text] → [corrected text]". ' +
            "Keep it concise and beginner-friendly."
        )
    ).describe(
        "List of all errors found. Empty array if hasErrors is false."
    ),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION = {
    MIN_LENGTH: 50,
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

const fixGrammarError = (error: string): GrammarFixResult =>
    errorResponse(error, { grammarFixes: [] });

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildGrammarPrompt(text: string): string {
    return `You are a grammar checker. Analyze the text below and identify ALL errors.

For each error found, return a string in this exact format:
"Error Type: [original phrase with error] → [corrected phrase]"

Error types to check: grammar, spelling, punctuation, word usage, sentence structure.

Rules:
- Be thorough — find every error, not just obvious ones
- Keep corrections simple and clear for beginners
- If the text has NO errors, set hasErrors to false and return an empty fixes array

Text to analyze:
"""
${text}
"""`;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Fix grammar errors in text using AI with structured output.
 *
 * Uses generateObject + Zod schema instead of generateText + manual parsing.
 * The SDK enforces the schema at model level — typed, reliable, zero regex.
 *
 * @param text - Text to check (50–50,000 characters)
 * @returns Array of grammar fix strings or empty array if none found
 */
export async function fixGrammar(text: string): Promise<GrammarFixResult> {
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
        }, true, "GRAMMAR");

        if (rateLimitError) {
            return fixGrammarError(rateLimitError);
        }

        // Input validation
        const trimmedText = text.trim();

        if (trimmedText.length < VALIDATION.MIN_LENGTH) {
            return fixGrammarError(
                `Please enter more text to fix (at least ${VALIDATION.MIN_LENGTH} characters).`
            );
        }

        if (text.length > VALIDATION.MAX_LENGTH) {
            return fixGrammarError(
                `Text to be fixed must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters.`
            );
        }

        // Connect to database
        await connectToDatabase();

        // Check daily usage limit
        const usageCount = await countAiFixGrammarDailyUsage(userId);
        const isAuthenticated = Boolean(session);
        const limit = isAuthenticated
            ? VALIDATION.DAILY_LIMITS.USER
            : VALIDATION.DAILY_LIMITS.GUEST;

        if (usageCount >= limit) {
            const message = isAuthenticated
                ? `Daily AI grammar fix limit reached (${limit}/${limit}).`
                : `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more grammar fixes!`;
            return fixGrammarError(message);
        }

        // ── generateObject replaces generateText + parseGrammarErrors ─────────
        const { object } = await generateObject({
            model: openrouter(getModelForFeature('GRAMMAR')),
            schema: grammarSchema,
            prompt: buildGrammarPrompt(text),
            temperature: 0.2, // Low — factual analysis needs consistency
        });

        // Record usage only when errors are found (fire-and-forget)
        if (object.hasErrors && object.fixes.length > 0) {
            createAiFixGrammarUsage(userId).catch((err) =>
                console.error("Failed to record grammar usage:", err)
            );
        }

        return {
            grammarFixes: object.hasErrors ? object.fixes : [],
            error: null,
        };

    } catch (err) {
        console.error("Error in fixGrammar:", err);
        return fixGrammarError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}