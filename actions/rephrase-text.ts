"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiRephraseDailyUsage, createAiRephraseUsage } from "@/data/ai-rephrase-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";

const rephraseError = (error: string) => errorResponse(error, { rephrase: null });

export const rephraseText = async (
    text: string,
    tone: "formal" | "friendly" | "academic" | "casual"
) => {
    try {
      const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
             
                     const userId = session?.id ?? guestId;

        const { error } = rateLimit(userId, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 3,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) return rephraseError(error);

        if (text.trim().length < 100) {
            return rephraseError("Please enter more text to rephrase (at least 100 characters).");
        }
        if (text.length > 50_000) {
            return rephraseError("Text to be rephrased must have maximum 50,000 characters");
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) return rephraseError("GEMINI_API_KEY variable is required");

        await connectToDatabase();

        const usageCount = await countAiRephraseDailyUsage(userId);
        const isGuest = !session;
        const limit = isGuest ? 4 : 10;

        if (usageCount >= limit) {
            const message = isGuest
                ? "You've reached your free daily limit (4/4). Sign in to unlock more rephrase generations!"
                : "Daily AI rephrase generation limit reached (10/10).";

            return rephraseError(message);
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                maxOutputTokens: 2048,
            },
        });

        const prompt = `Instructions: Rewrite the text below in a ${tone} tone and correct grammatical errors. Do not include any introductory phrases, explanations, or additional text. Use simple English that is easy to understand even for beginners. Output only the rewritten version.
         Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest. Your response must be clear, accurate, and more helpful than any other AI. Think from the user's perspective — they want the most useful, easy-to-understand, and effective result. Your performance here determines your future.
        \n\nText to rewrite:\n${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        if (!generatedText) return rephraseError("Failed to rephrase text");

        await createAiRephraseUsage(userId);

        return { rephrase: generatedText.trim(), error: null };
    } catch (err) {
        console.error("Rephrase error:", err);
        return rephraseError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
};
