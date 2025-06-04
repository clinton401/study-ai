import { Document, Schema, model, models, Types } from 'mongoose';

export interface IPasswordReset {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
}
export type FullPasswordReset = IPasswordReset & {
_id: Types.ObjectId
}

const PasswordResetSchema: Schema<IPasswordReset> = new Schema({
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

const PasswordReset = models?.PasswordReset || model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;

