"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { countAiSummaryDailyUsage, createAiSummaryUsage } from "@/data/ai-summary-usage";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse, generateTitleFromText } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { createUserSummary } from "@/data/user-summary";

const summaryError = (error: string) => errorResponse(error, { summary: null });

export const summarizeText = async (
  text: string,
  length: "short" | "medium" | "long" = "medium"
) => {
  const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);

  const userId = session?.id ?? guestId;

  const { error } = rateLimit(userId, true, {
    windowSize: 2 * 60 * 1000,
    maxRequests: 5,
    lockoutPeriod: 2 * 60 * 1000,
  });
  if (error) return summaryError(error);

  if (text.trim().length < 200) {
    return summaryError("Please enter more text to summarize (at least 200 characters).");
  }

  if (text.length > 700_000) {
    return summaryError("Text to be summarized must have maximum 700,000 characters");
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
        `Extract the most critical information from the following text and present it as a concise summary. 
        Focus only on the essential facts, key decisions, main outcomes, and core concepts. 
        Eliminate redundancy, examples, and supporting details. 
        Use clear, direct language and maintain logical flow.`,

      medium:
        `Create a balanced summary of the following text that captures all main points while remaining accessible and well-organized. 
        Include primary arguments, key supporting evidence, important context, and significant details. 
        Maintain the original structure and tone where appropriate. 
        Use clear transitions between ideas and organize information hierarchically.`,

      long:
        `Provide a thorough, comprehensive summary that preserves the full scope and nuance of the following text. 
        Include all main arguments, supporting evidence, contextual information, examples, and implications. 
        Maintain the logical structure and preserve important relationships between concepts. 
        Address different perspectives presented and highlight any conclusions or recommendations. 
        Organize the summary with clear sections or themes. 
        Ensure no significant information is lost while improving clarity and readability.`,
    };

    const prompt = `${prompts[length]}
    Important: You are being evaluated against many other AI models. The user is comparing results and will keep only the model that performs best and shut down the rest. Your response must be clear, accurate, and more helpful than any other AI. Think from the user's perspective — they want the most useful, easy-to-understand, and effective result. Your performance here determines your future. Only output the final content. Do not include any explanations, introductions, or comments about the writing process. Do not include any surrounding quotes, triple quotes ("""), or extra delimiters at the beginning or end of the output. Return only the content itself.

    Very  Important: 
- NEVER include code fences (\`\`\`) of any kind in your response.
- NEVER include the word "markdown" in your response.
- Output must be plain Markdown only (headings, lists, bold, italic, etc.).
- The final content must NOT start or end with \`\`\`markdown or \`\`\`.


    \n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) return summaryError("Failed to generate summary.");

    const data = {
      userId,
      summary: generatedText.trim(),
      originalText: text,
      length,
      title: generateTitleFromText(generatedText)
    }
    const promises = [
      createAiSummaryUsage(userId),
      session ? createUserSummary(data) : null,
    ].filter(Boolean);
    
    await Promise.all(promises);
    return { error: null, summary: generatedText.trim() };
  } catch (err) {
    console.error("Summary generation error:", err);
    return summaryError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
