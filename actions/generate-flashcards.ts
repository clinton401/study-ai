"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { countFlashcardsDailyUsage, createFlashcardsUsage } from "@/data/flashcards-usage";
import { createUserFlashcards } from "@/data/user-flashcards";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

function validateFlashcards(data: Flashcard[]): data is Flashcard[] {
  if (!Array.isArray(data)) return false;

  return data.every((fc, index) =>
    typeof fc.id === "number" &&
    fc.id === index + 1 &&
    typeof fc.front === "string" &&
    fc.front.trim().length > 0 &&
    typeof fc.back === "string" &&
    fc.back.trim().length > 0
  );
}

const flashcardError = (error: string) => errorResponse(error, { flashcards: null });

export const generateFlashcards = async (text: string, count: number = 20) => {
  const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
  const userId = session?.id ?? guestId;

  const { error } = rateLimit(userId, true, {
    windowSize: 2 * 60 * 1000,
    maxRequests: 5,
    lockoutPeriod: 2 * 60 * 1000,
  });
  if (error) return flashcardError(error);

  if (text.trim().length < 200) {
    return flashcardError("Please provide at least 200 characters of text to generate flashcards.");
  }
   if (text.length > 700_000) {
    return flashcardError("Text must have maximum 700,000 characters");
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return flashcardError("GEMINI_API_KEY variable is required");

  try {
    await connectToDatabase();

    const usageCount = await countFlashcardsDailyUsage(userId);
    const isGuest = !session;
    const limit = isGuest ? 4 : 10;

    if (usageCount >= limit) {
      const message = isGuest
        ? "You've reached your free daily limit (4/4). Sign in to unlock more flashcard generations!"
        : "Daily AI flashcard generation limit reached (10/10).";

      return flashcardError(message);
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

    const prompt = `
Generate exactly ${count} flashcards from the following text.

Output must be valid JSON only, in the following format:
[
  {
    "id": 1,
    "front": "What is photosynthesis?",
    "back": "The process by which plants convert sunlight into energy"
  },
  {
    "id": 2,
    "front": "Question or concept here?",
    "back": "Clear, concise answer here"
  }
]

Important Rules:
- "id" starts at 1 and increments by 1 for each flashcard.
- "front" must always contain the question or prompt (short and clear).
- "back" must always contain the correct answer or explanation.
- Do NOT include explanations, introductions, comments, or code fences.
- ONLY return valid JSON.
- Flashcards should be diverse and useful for studying.

Text to generate from:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) return { error: "Failed to generate flashcards." };

    let flashcards: Flashcard[] = [];
    try {
      const cleanText = generatedText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      flashcards = JSON.parse(cleanText);

      if (!Array.isArray(flashcards)) {
        return flashcardError("Invalid format: not an array");
      }
    } catch (err) {
      console.error("Failed to parse flashcards JSON:", err, generatedText);
      return { error: "Invalid JSON format from AI" };
    }

    if (!validateFlashcards(flashcards)) {
      console.error("Validation failed:", flashcards);
      return { error: "Invalid flashcard structure returned from AI" };
    }

    const data = {
      userId,
      flashcards,
      originalText: text,
      count,
    };

    const promises = [
      createFlashcardsUsage(userId),
      session ? createUserFlashcards(data) : null, 
    ].filter(Boolean);

    await Promise.all(promises);

    return { error: null, flashcards };
  } catch (err) {
    console.error("Flashcard generation error:", err);
    return flashcardError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
