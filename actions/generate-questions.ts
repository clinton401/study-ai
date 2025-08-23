"use server";
import { connectToDatabase } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { countAiQuestionsDailyUsage, createAiQuestionsUsage } from "@/data/ai-questions-usage";
import { createUserQuestions } from "@/data/user-questions";
interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

function validateQuestions(data: Question[]): data is Question[] {
    if (!Array.isArray(data)) return false;

    return data.every((q, index) =>
        typeof q.id === "number" &&
        q.id === index + 1 &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(opt => typeof opt === "string") &&
        typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length
    );
}
const questionError = (error: string) => errorResponse(error, { questions: null });

export const generateQuestions = async (
    text: string,
    count: number = 25
) => {
    const [session, guestId] = await Promise.all([getServerUser(), getOrCreateGuestId()]);
    const userId = session?.id ?? guestId;

    const { error } = rateLimit(userId, true, {
        windowSize: 2 * 60 * 1000,
        maxRequests: 5,
        lockoutPeriod: 2 * 60 * 1000,
    });
    if (error) return questionError(error);

    if (text.trim().length < 200) {
        return questionError("Please provide at least 200 characters of text to generate questions.");
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return questionError("GEMINI_API_KEY variable is required");

    try {
        await connectToDatabase();

        const usageCount = await countAiQuestionsDailyUsage(userId);
        const isGuest = !session;
        const limit = isGuest ? 4 : 10;

        if (usageCount >= limit) {
            const message = isGuest
                ? "You've reached your free daily limit (4/4). Sign in to unlock more question generations!"
                : "Daily AI question generation limit reached (10/10).";

            return questionError(message);
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
Generate exactly ${count} multiple-choice practice questions from the following text.

Output must be valid JSON only, in the following format:
[
  {
    "id": 1,
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "question": "Another question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]

Important Rules:
- "id" starts at 1 and increments by 1 for each question.
- "question" must be a clear question string.
- "options" must always contain exactly 4 unique strings.
- "correctAnswer" must be the ZERO-BASED index (0–3) of the correct option in the "options" array.
- Do NOT include explanations, introductions, comments, or code fences.
- ONLY return valid JSON.
- Questions generated should be random

Text to generate from:
${text}
`;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        if (!generatedText) return { error: "Failed to generate questions." };

        let questions: Question[] = [];
        try {
            const cleanText = generatedText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            questions = JSON.parse(cleanText);

            if (!Array.isArray(questions)) {
                return questionError("Invalid format: not an array");
            }
        } catch (err) {
            console.error("Failed to parse questions JSON:", err, generatedText);
            return { error: "Invalid JSON format from AI" };
        }

        if (!validateQuestions(questions)) {
            console.error("Validation failed:", questions);
            return { error: "Invalid question structure returned from AI" };
        }

        const data = {
            userId,
            questions,
            originalText: text,
            count,
        };

        const promises = [
            createAiQuestionsUsage(userId),
            session ? createUserQuestions(data) : null,
        ].filter(Boolean);

        await Promise.all(promises);

        return { error: null, questions };
    } catch (err) {
        console.error("Question generation error:", err);
        return questionError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
};
