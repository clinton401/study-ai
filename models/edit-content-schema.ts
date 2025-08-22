
import { Document, Schema, model, models } from "mongoose";

export interface IEditContent extends Document {
  userId: Schema.Types.ObjectId; 
  createdAt: Date;
}

const EditContentSchema = new Schema<IEditContent>(
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

const EditContent =  models.EditContent || model<IEditContent>("EditContent", EditContentSchema);
export default EditContent
