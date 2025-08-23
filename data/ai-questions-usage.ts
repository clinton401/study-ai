import AiQuestionsUsage from "@/models/ai-questions-usage-schema";
import { Types } from "mongoose";

export async function createAiQuestionsUsage(userId: Types.ObjectId) {
    return AiQuestionsUsage.create({ userId });
}

export async function countAiQuestionsDailyUsage(userId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return AiQuestionsUsage.countDocuments({
        userId,
        createdAt: { $gte: today },
    });
}
