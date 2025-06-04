"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiRephraseDailyUsage, createAiRephraseUsage } from "@/data/ai-rephrase-usage";
import { rateLimit } from "@/lib/rate-limit";
import axios, {AxiosError} from "axios";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";



const rephraseError = (error: string) => errorResponse(error, { rephrase: null });

export const rephraseText = async(text: string, tone: "formal" | "friendly" | "academic" | "casual") => {
    try{
        const session = await getServerUser();
        if (!session) {
            return rephraseError(ERROR_MESSAGES.UNAUTHORIZED);
        }

        const { error } = rateLimit(session.id, true, {
            windowSize: 2 * 60 * 1000,
            maxRequests: 3,
            lockoutPeriod: 2 * 60 * 1000,
        });
        if (error) {
            return rephraseError(error);
        }

        if (text.trim().length < 100) {
            return rephraseError("Please enter more text to rephrase (at least 100 characters).");
        }

        if (text.length > 50_000) return rephraseError("Text to be rephrased must have maximum 50,000 characters");
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return rephraseError("GEMINI_API_KEY variable is required");
        }
        await connectToDatabase();
        
            const usageCount = await countAiRephraseDailyUsage(session.id);
            if (usageCount >= 10) {
              return rephraseError("Daily AI rephrase generation limit reached (10/10)");
            }
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Instructions: Rewrite the text below in a ${tone} tone and correct grammatical errors. Do not include any introductory phrases, explanations, or additional text. Output only the rewritten version.\n\nText to rewrite:\n${text}`
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
              );
              const result = response.data?.candidates[0]?.content?.parts[0]?.text;
          

        
        
          if(!result) return rephraseError("Failed to rephrase text");

          await createAiRephraseUsage(session.id);
          return { rephrase: result, error: null };
        
          

    }catch(err){
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;

            console.error("Axios error status:", axiosError.response?.status);
            console.error("Axios error data:", axiosError.response?.data);
        } else {
            console.error("Unknown error:", err);
          }

        return rephraseError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}