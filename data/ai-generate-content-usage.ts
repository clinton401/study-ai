import AIGenerateContentUsage from "@/models/ai-fix-grammar-usage-schema";
import {Types} from "mongoose";

export const countAiGenerateContentDailyUsage = (userId: Types.ObjectId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIGenerateContentUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiGenerateContentUsage= (userId: Types.ObjectId) => {
return AIGenerateContentUsage.create({ userId });
}

