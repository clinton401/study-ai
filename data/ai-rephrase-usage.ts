import AIRephraseUsage from "@/models/ai-rephrase-usage-schema";
import { Types } from "mongoose";

export const countAiRephraseDailyUsage = (userId: Types.ObjectId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIRephraseUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiRephraseUsage= (userId: Types.ObjectId) => {
return AIRephraseUsage.create({ userId });
}

