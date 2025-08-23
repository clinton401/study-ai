import UserFlashcards, { Flashcard } from "@/models/user-flashcards-schema";
import { Types } from "mongoose";

export async function createUserFlashcards(data: {
    userId: Types.ObjectId;
    flashcards: Flashcard[];
    originalText: string;
    count: number;
}) {
    const newFlashcards = new UserFlashcards(data);
    await newFlashcards.save();
    return newFlashcards;
}
