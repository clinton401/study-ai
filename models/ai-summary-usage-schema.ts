
import { Document, Schema, model, models } from "mongoose";

export interface IAiSummaryUsage extends Document {
  userId: Schema.Types.ObjectId; 
  createdAt: Date;
}

const AiSummaryUsageSchema = new Schema<IAiSummaryUsage>(
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

const AISummaryUsage =  models.AiSummaryUsage || model<IAiSummaryUsage>("AiSummaryUsage", AiSummaryUsageSchema);
export default AISummaryUsage
