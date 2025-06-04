
import { Document, Schema, model, models } from "mongoose";

export interface IAiGenerateContentUsage extends Document {
  userId: Schema.Types.ObjectId; 
  createdAt: Date;
}

const AiGenerateContentUsageSchema = new Schema<IAiGenerateContentUsage>(
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

const AIGenerateContentUsage =  models.AiGenerateContentUsage || model<IAiGenerateContentUsage>("AiGenerateContentUsage", AiGenerateContentUsageSchema);
export default AIGenerateContentUsage
