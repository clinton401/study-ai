import AISummaryUsage from "@/models/ai-summary-usage-schema";
import { Types } from "mongoose";

export const countAiSummaryDailyUsage = (userId: Types.ObjectId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AISummaryUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiSummaryUsage= (userId: Types.ObjectId) => {
return AISummaryUsage.create({ userId });
}

