
import { Document, Schema, model, models } from "mongoose";

export interface IAiRephraseUsage extends Document {
  userId: Schema.Types.ObjectId; 
  createdAt: Date;
}

const AiRephraseUsageSchema = new Schema<IAiRephraseUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

const AIRephraseUsage =  models.AiRephraseUsage || model<IAiRephraseUsage>("AiRephraseUsage", AiRephraseUsageSchema);
export default AIRephraseUsage
