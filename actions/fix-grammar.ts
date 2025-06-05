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
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";

const fixGrammarError = (error: string) =>
    errorResponse(error, { grammarFixes: [] });

export const fixGrammar = async (text: string) => {
    try {
        const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);

        const userId = session?.id ?? guestId;
        const { error } = rateLimit(userId, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 3,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) {
            return fixGrammarError(error);
        }

        if (text.trim().length < 50) {
            return fixGrammarError(
                "Please enter more text to fix (at least 50 characters)."
            );
        }

        if (text.length > 50_000)
            return fixGrammarError(
                "Text to be fixed must have maximum 50,000 characters"
            );

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return fixGrammarError("GEMINI_API_KEY variable is required");
        }

        await connectToDatabase();

        const usageCount = await countAiFixGrammarDailyUsage(userId);
        const isAuthenticated = Boolean(session);
        const limit = isAuthenticated ? 10 : 4;

        if (usageCount >= limit) {
            const message = isAuthenticated
                ? "Daily AI grammar fix generation limit reached (10/10)."
                : "You've reached your free daily limit (4/4). Sign in to unlock more grammar fixes!";

            return fixGrammarError(message);
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                maxOutputTokens: 2048,
            }
        });

        const prompt = `Check the following text for errors and list each error found. Include:
- Grammar errors
- Spelling mistakes  
- Punctuation errors
- Word usage errors
- Sentence structure issues
- When suggesting fixes, use simple and clear English. Avoid advanced vocabulary or complex grammar structures. The corrected sentences should be easy for a beginner-level English speaker to understand.
-for fixes that has original and correction put them in the same texts rather than in separate texts

Important: Return only the error list, with the fixes with no introductory text explanations or extra texts. If no errors are found, respond with exactly "No errors found".
 Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest. Your response must be clear, accurate, and more helpful than any other AI. Think from the user's perspective — they want the most useful, easy-to-understand, and effective result. Your performance here determines your future.
Text to check:
${text}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        if (
            !responseText ||
            responseText.toLowerCase().includes("no errors found") ||
            responseText.toLowerCase().includes("no errors") ||
            responseText.trim() === ""
        ) {
            return { grammarFixes: [], error: null };
        }

        const errors = responseText
            .split("\n")
            .map((error) => error.trim())
            .filter(
                (error) =>
                    typeof error === "string" &&
                    error.length > 0 &&
                    !error.toLowerCase().includes("no errors")
            )
            .map((error) => error.replace(/^[-•*\d.]\s*/, ""));

        await createAiFixGrammarUsage(userId);
        return { grammarFixes: errors, error: null };
    } catch (err) {
        console.error("Error in fixGrammar:", err);
        return fixGrammarError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
};
