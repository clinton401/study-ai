"use server"
import { findUserById, updateUser } from "@/data/user";
import { findPasswordResetTokenByUserId, deletePasswordResetToken } from "@/data/password-reset";
import { connectToDatabase } from "@/lib/db";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { errorResponse, hasExpired } from "@/lib/main";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { Types } from "mongoose";
import { validatePassword, hashPassword } from "@/lib/password-utils";

export const resetPassword = async (data: ResetPasswordFormData, userId: string, code: string) => {
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS);
    try {
        const userId = await getOrCreateGuestId();
        const { error } = rateLimit(userId, false);
        if (error) return errorResponse(error);
        const { password } = result.data;
        await connectToDatabase();
        const validId = new Types.ObjectId(userId);
        const [user, token] = await Promise.all([findUserById(validId), findPasswordResetTokenByUserId(validId)]);
        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);
        if (!user.password) return errorResponse(ERROR_MESSAGES.PASSWORD_NOT_SET)

        if (!token) return errorResponse("No password reset token available for user.");
        const isExpired = hasExpired(token.expiresAt);
        if (isExpired) return errorResponse("This password reset link has expired. Please request a new one.");

        const isOtpValid = code === token.code;
        if (!isOtpValid) return errorResponse("This password reset link is invalid. Please check the link or request a new one.");

        const isPasswordTheSameAsLast = await validatePassword(password, user.password);
        
        if (isPasswordTheSameAsLast) return errorResponse(ERROR_MESSAGES.SAME_AS_OLD_PASSWORD);
        const hashedPassword = await hashPassword(password);
        await updateUser(validId, { password: hashedPassword });
        await deletePasswordResetToken(token._id);

        return {
            error: null,
            success: "Password changed successfully"
        }



    } catch (error) {
        console.error(`Unable to reset password: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}