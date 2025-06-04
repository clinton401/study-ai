
import { Document, Schema, model, models } from "mongoose";

export interface IAiFixGrammarUsage extends Document {
  userId: Schema.Types.ObjectId; 
  createdAt: Date;
}

const AiFixGrammarUsageSchema = new Schema<IAiFixGrammarUsage>(
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

const AIFixGrammarUsage =  models.AiFixGrammarUsage || model<IAiFixGrammarUsage>("AiFixGrammarUsage", AiFixGrammarUsageSchema);
export default AIFixGrammarUsage
