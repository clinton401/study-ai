import AIFixGrammarUsage from "@/models/ai-fix-grammar-usage-schema";

export const countAiFixGrammarDailyUsage = (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIFixGrammarUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiFixGrammarUsage= (userId: string) => {
return AIFixGrammarUsage.create({ userId });
}

