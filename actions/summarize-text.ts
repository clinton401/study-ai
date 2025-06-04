"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiSummaryDailyUsage, createAiSummaryUsage } from "@/data/ai-summary-usage";
import { rateLimit } from "@/lib/rate-limit";
import axios, {AxiosError} from "axios";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";

const summarizeChunk = async (chunk: string, token: string, maxLength : number) => {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    { inputs: chunk, parameters: { max_length: maxLength }},
    {   
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const result = response.data[0].summary_text;
  if(!result){
    throw new Error("Failed to generate summary.")
  }
  return result
};
const summaryError = (error: string) => errorResponse(error, { summary: null });
export const summarizeText = async (
  text: string,
  length: "short" | "medium" | "long" = "medium"
) => {
  const session = await getServerUser();
  if (!session) {
    return summaryError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const { error } = rateLimit(session.id, true, {
    windowSize: 2 * 60 * 1000,    
    maxRequests: 3,
    lockoutPeriod: 2 * 60 * 1000,  
});
  if (error) {
    return summaryError(error);
  }

  if (text.trim().length < 200) {
    return summaryError("Please enter more text to summarize (at least 200 characters).");
  }

  if(text.length > 100000) return summaryError("Text to be summarized must have maximum 100,000 characters");
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return summaryError("GEMINI_API_KEY variable is required");
  }  
  
  try {
    await connectToDatabase();

    const usageCount = await countAiSummaryDailyUsage(session.id);
    if (usageCount >= 10) {
      return summaryError("Daily AI summary generation limit reached (10/10)");
    }

    type SummaryType = 'short' | 'medium' | 'long';
    const summaryPrompts = {
      short: `Extract and present only the key points from the following text. Focus on the most essential information and present it concisely. Return only the summary with no additional commentary or introductory phrases:`,

      medium: `Summarize the following text maintaining all main points while keeping it moderately detailed and well-structured. Return only the summary with no additional commentary or introductory phrases:`,

      long: `Create a comprehensive summary of the following text. Include all main points, important details, supporting information, and context. Cover all aspects thoroughly. Return only the summary with no additional commentary or introductory phrases:`
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${(summaryPrompts[(length.toLowerCase() as SummaryType)] as string)}\n\n${text}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]) {

      const summary = response.data?.candidates[0]?.content?.parts[0]?.text?.trim();
      if (!summary) {
        return summaryError("Failed to generate summary.");
      }
  
      await createAiSummaryUsage(session.id); 
  
      return { error: null, summary };
    } else {
      console.error('Unexpected response structure:', response.data);
      return summaryError('Unexpected response from AI');
    }

   
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;

      console.error("Axios error status:", axiosError.response?.status);
      console.error("Axios error data:", axiosError.response?.data);
    } else {
      console.error("Unknown error:", err);
    }
    return summaryError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
