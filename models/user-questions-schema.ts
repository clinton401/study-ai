import  { Schema, Types, models, model } from "mongoose";

export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface UserQuestionsDoc  {
    userId: string;
    questions: Question[];
    originalText: string;
    count: number;
    createdAt: Date;
}
export type FullUserQuestion = UserQuestionsDoc & {
  _id: Types.ObjectId
}

const QuestionSchema = new Schema<Question>(
    {
        id: { type: Number, required: true },
        question: { type: String, required: true },
        options: { type: [String], required: true, validate: (arr: string[]) => arr.length === 4 },
        correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    },
    { _id: false }
);

const UserQuestionsSchema = new Schema<UserQuestionsDoc>({
    userId: { type: String, required: true, ref: "User", },
    questions: { type: [QuestionSchema], required: true },
    originalText: { type: String, required: true },
    count: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const UserQuestions = models.UserQuestions || model<UserQuestionsDoc>(
  "UserQuestions",
    UserQuestionsSchema
);
export default UserQuestions;