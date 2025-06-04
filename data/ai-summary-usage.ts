import AISummaryUsage from "@/models/ai-summary-usage-schema";

export const countAiSummaryDailyUsage = (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AISummaryUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiSummaryUsage= (userId: string) => {
return AISummaryUsage.create({ userId });
}

