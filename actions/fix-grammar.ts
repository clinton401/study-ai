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
import { generateText } from 'ai';
import { openrouter, getModelForFeature } from "@/lib/ai-client";

// Type definitions
interface GrammarFixResult {
    grammarFixes: string[];
    error: string | null;
}

// Constants
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

/**
 * Build optimized grammar check prompt
 */
function buildGrammarPrompt(text: string): string {
    return `Analyze the following text and list ALL errors found. For each error, provide:
- The type of error (grammar/spelling/punctuation/word usage/sentence structure)
- The original text with the error
- The corrected version
- Keep corrections simple and clear for beginners

FORMAT REQUIREMENTS:
- One error per line
- Format: "Error Type: [original] → [correction]"
- If NO errors found, respond with exactly: "No errors found"
- NO introductions, explanations, or additional text
- NO numbered lists or bullet points

Text to check:
${text}`;
}

/**
 * Parse AI response into structured error list
 * Handles various response formats gracefully
 */
function parseGrammarErrors(responseText: string): string[] {
    const normalized = responseText.trim();

    // Check for "no errors" responses
    if (
        !normalized ||
        normalized.toLowerCase().includes("no errors found") ||
        normalized.toLowerCase().includes("no errors")
    ) {
        return [];
    }

    // Split by newlines and clean up
    return normalized
        .split("\n")
        .map(line => line.trim())
        .filter(line => {
            // Filter out empty lines and "no errors" mentions
            return (
                line.length > 0 &&
                !line.toLowerCase().includes("no errors")
            );
        })
        .map(line => {
            // Remove list markers (-, •, *, numbers)
            return line.replace(/^[-•*\d.)\]]+\s*/, "");
        })
        .filter(line => line.length > 0); // Final cleanup
}

/**
 * Fix grammar errors in text using AI
 * 
 * @param text - Text to check (50-50,000 characters)
 * @returns Array of grammar errors or empty array if none found
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
                `Text to be fixed must have maximum ${VALIDATION.MAX_LENGTH.toLocaleString()} characters`
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
                ? `Daily AI grammar fix generation limit reached (${limit}/${limit}).`
                : `You've reached your free daily limit (${limit}/${limit}). Sign in to unlock more grammar fixes!`;

            return fixGrammarError(message);
        }

        // Generate grammar analysis using Vercel AI SDK v4
        const { text: responseText } = await generateText({
            model: openrouter(getModelForFeature('GRAMMAR')),
            prompt: buildGrammarPrompt(text),
            temperature: 0.3, // Lower temperature for factual analysis
            topP: 0.9,
        });

        // Parse and validate errors
        const errors = parseGrammarErrors(responseText);

        // Record usage (fire-and-forget)
        if (errors.length > 0) {
            createAiFixGrammarUsage(userId).catch(err =>
                console.error("Failed to record usage:", err)
            );
        }

        return { grammarFixes: errors, error: null };

    } catch (err) {
        console.error("Error in fixGrammar:", err);
        return fixGrammarError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}