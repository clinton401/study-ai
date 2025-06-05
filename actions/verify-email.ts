"use server";

import { connectToDatabase } from "@/lib/db";
import { findUserById, updateUser } from "@/data/user";
import { errorResponse, hasExpired } from "@/lib/main";
import { VerifyEmailFormData, verifyEmailSchema } from "@/lib/validations/auth";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { findVerificationTokenByUserId, deleteVerificationToken } from "@/data/verification";
import { Types } from "mongoose";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";
import { rateLimit } from "@/lib/rate-limit";


export const verifyEmail = async (userId: string, data: VerifyEmailFormData) => {
    const result = verifyEmailSchema.safeParse(data);
    if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS);
    const guestId = await getOrCreateGuestId();
    const { error } = rateLimit(guestId, false)
    if (error) return errorResponse(error)
    try {

        if (!Types.ObjectId.isValid(userId)) return errorResponse("Invalid User ID");

        const validId = new Types.ObjectId(userId);
        const { otp } = result.data;
        await connectToDatabase();

        const [user, token] = await Promise.all([findUserById(validId), findVerificationTokenByUserId(validId)]);
        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);
        if (user.isVerified) return errorResponse("Email has already been verified");
        if (!token) return errorResponse("No verification token available for user.");

        const isExpired = hasExpired(token.expiresAt);
        if (isExpired) return errorResponse(ERROR_MESSAGES.EXPIRED_CODE);

        const isOtpValid = otp === token.code;
        if (!isOtpValid) return errorResponse(ERROR_MESSAGES.INVALID_CODE)
        await updateUser(validId, { isVerified: true });

        await deleteVerificationToken(token._id)
        return {
            error: null,
            success: "Email verified successfully"
        }


    } catch (error) {
        console.error(`Unable to verify email: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}