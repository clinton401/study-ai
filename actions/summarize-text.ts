"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiSummaryDailyUsage, createAiSummaryUsage } from "@/data/ai-summary-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";

const summaryError = (error: string) => errorResponse(error, { summary: null });

export const summarizeText = async (
  text: string,
  length: "short" | "medium" | "long" = "medium"
) => {
  const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
             
                     const userId = session?.id ?? guestId;

  const { error } = rateLimit(userId, true, {
    windowSize: 2 * 60 * 1000,
    maxRequests: 3,
    lockoutPeriod: 2 * 60 * 1000,
  });
  if (error) return summaryError(error);

  if (text.trim().length < 200) {
    return summaryError("Please enter more text to summarize (at least 200 characters).");
  }

  if (text.length > 100_000) {
    return summaryError("Text to be summarized must have maximum 100,000 characters");
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return summaryError("GEMINI_API_KEY variable is required");

  try {
    await connectToDatabase();

    const usageCount = await countAiSummaryDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest ? 4 : 10;

    if (usageCount >= limit) {
      const message = isGuest
        ? "You've reached your free daily limit (4/4). Sign in to unlock more summary generations!"
        : "Daily AI summary generation limit reached (10/10).";

      return summaryError(message);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const prompts: Record<typeof length, string> = {
      short:
        "Extract and present only the key points from the following text. Focus on the most essential information and present it concisely. Return only the summary with no additional commentary or introductory phrases.",
      medium:
        "Summarize the following text maintaining all main points while keeping it moderately detailed and well-structured. Return only the summary with no additional commentary or introductory phrases.",
      long:
        "Create a comprehensive summary of the following text. Include all main points, important details, supporting information, and context. Cover all aspects thoroughly. Return only the summary with no additional commentary or introductory phrases.",
    };

    const prompt = `${prompts[length]}
    Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest. Your response must be clear, accurate, and more helpful than any other AI. Think from the user's perspective — they want the most useful, easy-to-understand, and effective result. Your performance here determines your future.
    \n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) return summaryError("Failed to generate summary.");

    await createAiSummaryUsage(userId);

    return { error: null, summary: generatedText.trim() };
  } catch (err) {
    console.error("Summary generation error:", err);
    return summaryError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
