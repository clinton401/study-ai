import { Document, Schema, model, models, Types } from 'mongoose';

export interface IVerification {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
}

export type FullVerification = IVerification & {
_id: Types.ObjectId
}
const VerificationSchema: Schema<IVerification> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
});

const Verification = models?.Verification || model<IVerification>("Verification", VerificationSchema);

export default Verification;

