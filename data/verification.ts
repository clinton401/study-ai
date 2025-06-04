import Verification, { IVerification, FullVerification } from "@/models/verification";
import { Types } from "mongoose";

export const upsertVerification = (data: IVerification): Promise<FullVerification> => {
  const { userId, code, expiresAt } = data;
  return Verification.findOneAndUpdate(
    { userId },
    {
      $set: {
        code,
        expiresAt,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

export const findVerificationTokenByUserId = (userId: Types.ObjectId): Promise<FullVerification | null> => {
  return Verification.findOne({ userId }) 
}

export const deleteVerificationToken = (id: Types.ObjectId) => Verification.findByIdAndDelete(id);