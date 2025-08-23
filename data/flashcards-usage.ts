import FlashcardsUsage from "@/models/flashcards-usage-schema";
import { Types } from "mongoose";

export async function createFlashcardsUsage(userId: Types.ObjectId) {
    return FlashcardsUsage.create({ userId });
}

export async function countFlashcardsDailyUsage(userId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return FlashcardsUsage.countDocuments({
        userId,
        createdAt: { $gte: today },
    });
}
