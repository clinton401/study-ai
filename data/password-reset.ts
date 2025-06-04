import PasswordReset, { IPasswordReset, FullPasswordReset } from "@/models/password-reset";
import { Types } from "mongoose";

export const upsertPasswordReset = (data: IPasswordReset): Promise<FullPasswordReset> => {
  const { userId, code, expiresAt } = data;
  return PasswordReset.findOneAndUpdate(
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

export const findPasswordResetTokenByUserId = (userId: Types.ObjectId): Promise<FullPasswordReset | null> => {
  return PasswordReset.findOne({ userId }) 
}

export const deletePasswordResetToken = (id: Types.ObjectId) => PasswordReset.findByIdAndDelete(id);