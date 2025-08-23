import mongoose, { Schema, Document } from "mongoose";

export interface IAiQuestionsUsage extends Document {
    userId: string;
    createdAt: Date;
}

const AiQuestionsUsageSchema = new Schema<IAiQuestionsUsage>(
    {
        userId: { type: String, required: true, ref: "User", },
        createdAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    { timestamps: false }
);

export default mongoose.models.AiQuestionsUsage ||
    mongoose.model<IAiQuestionsUsage>("AiQuestionsUsage", AiQuestionsUsageSchema);
