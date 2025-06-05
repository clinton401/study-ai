import AIFixGrammarUsage from "@/models/ai-fix-grammar-usage-schema";
import {Types} from "mongoose";

export const countAiFixGrammarDailyUsage = (userId: Types.ObjectId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return AIFixGrammarUsage.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createAiFixGrammarUsage= (userId: Types.ObjectId) => {
return AIFixGrammarUsage.create({ userId });
}

