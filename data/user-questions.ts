import UserQuestions, { Question } from "@/models/user-questions-schema";
import { Types } from "mongoose";

export async function createUserQuestions(data: {
    userId: Types.ObjectId;
    questions: Question[];
    originalText: string;
    count: number;
}) {
    const newQuestions = new UserQuestions(data);
    await newQuestions.save();
    return newQuestions;
}