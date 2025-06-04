import AIRephraseUsage from "@/models/ai-rephrase-usage-schema";

export const countAiRephraseDailyUsage = (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIRephraseUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiRephraseUsage= (userId: string) => {
return AIRephraseUsage.create({ userId });
}

