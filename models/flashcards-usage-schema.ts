import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcardsUsage extends Document {
  userId: string;
  createdAt: Date;
}

const FlashcardsUsageSchema = new Schema<IFlashcardsUsage>(
  {
    userId: { type: String, required: true, ref: "User" },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

export default mongoose.models.FlashcardsUsage ||
  mongoose.model<IFlashcardsUsage>("FlashcardsUsage", FlashcardsUsageSchema);
