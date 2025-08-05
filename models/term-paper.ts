import { Types, Schema, model, models } from "mongoose";

type ContentType = "essay" | "letter" | "term-paper";
type Tone = "formal" | "academic" | "casual" | "friendly";
type Length = "short" | "medium" | "long";

export interface ITermPaper {
  userId: Types.ObjectId;
  topic: string;
  content: string;
  wordCount?: number;
  type: ContentType;
  tone: Tone;
  length: Length;
  createdAt: Date;
}

const TermPaperSchema = new Schema<ITermPaper>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    wordCount: {
      type: Number,
    },
    type: {
      type: String,
      enum: ["essay", "letter", "term-paper"],
      required: true,
    },
    tone: {
      type: String,
      enum: ["formal", "academic", "casual", "friendly"],
      required: true,
    },
    length: {
      type: String,
      enum: ["short", "medium", "long"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

const TermPaper =
  models.TermPaper || model<ITermPaper>("TermPaper", TermPaperSchema);

export default TermPaper;
