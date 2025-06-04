"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiFixGrammarDailyUsage, createAiFixGrammarUsage } from "@/data/ai-fix-grammar-usage";
import { rateLimit } from "@/lib/rate-limit";
import axios, { AxiosError } from "axios";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";



const fixGrammarError = (error: string) => errorResponse(error, { grammarFixes: [] });

export const fixGrammar = async (text: string) => {
    try {
        const session = await getServerUser();
        if (!session) {
            return fixGrammarError(ERROR_MESSAGES.UNAUTHORIZED);
        }

        const { error } = rateLimit(session.id, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 3,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) {
            return fixGrammarError(error);
        }

        if (text.trim().length < 50) {
            return fixGrammarError("Please enter more text to fix (at least 50 characters).");
        }

        if (text.length > 50_000) return fixGrammarError("Text to be fixed must have maximum 50,000 characters");
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return fixGrammarError("GEMINI_API_KEY variable is required");
        }
        await connectToDatabase();

        const usageCount = await countAiFixGrammarDailyUsage(session.id);
        if (usageCount >= 10) {
            return fixGrammarError("Daily AI grammar fix generation limit reached (10/10)");
        }
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Check the following text for errors and list each error found. Include:
          - Grammar errors
          - Spelling mistakes  
          - Punctuation errors
          - Word usage errors
          - Sentence structure issues
          
          Important: Return only the error list with no introductory text or explanations. If no errors are found, respond with exactly "No errors found".
          
          Text to check:
          ${text}`
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
          );

        const result = response.data?.candidates[0]?.content?.parts[0]?.text?.trim();




        if (!result) return fixGrammarError("Failed to generate grammar fixes");
        if (result.toLowerCase().includes('no errors found') ||
            result.toLowerCase().includes('no errors') ||
            result.trim() === '') {
            return { grammarFixes:  [], error: null};
        }
        const errors = result
            .split('\n')
            .map((error: string) => error.trim())
            .filter((error: string) =>
                typeof error === 'string' &&                
                error.length > 0 &&
                !error.toLowerCase().includes('no errors')
            )
            .map((error: string) => error.replace(/^[-•*\d.]\s*/, ''));
        await createAiFixGrammarUsage(session.id);
        return { grammarFixes: (errors as string[]), error: null };



    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;

            console.error("Axios error status:", axiosError.response?.status);
            console.error("Axios error data:", axiosError.response?.data);
        } else {
            console.error("Unknown error:", err);
        }

        return fixGrammarError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}