import { Types, Schema, model, models } from "mongoose";

export interface IUserSummary {
  userId: Types.ObjectId;
  summary: string;
  originalText?: string;
  length: "short" | "medium" | "long";
  title?: string;
  createdAt: Date;
}

const UserSummarySchema = new Schema<IUserSummary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    originalText: {
      type: String,
    },
    length: {
      type: String,
      enum: ["short", "medium", "long"],
      required: true,
    },
    title: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

const UserSummary = models.UserSummary || model<IUserSummary>(
  "UserSummary",
  UserSummarySchema
);

export default UserSummary;
