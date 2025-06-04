import AIGenerateContentUsage from "@/models/ai-fix-grammar-usage-schema";

export const countAiGenerateContentDailyUsage = (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIGenerateContentUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiGenerateContentUsage= (userId: string) => {
return AIGenerateContentUsage.create({ userId });
}

