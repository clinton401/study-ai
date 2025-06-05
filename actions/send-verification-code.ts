"use server";


import { findUserById } from "@/data/user";
import { upsertVerification } from "@/data/verification";
import { connectToDatabase } from "@/lib/db";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { verificationEmailTemplate } from "@/lib/html-templates";
import { sendEmail } from "@/lib/mailer";
import { errorResponse, otpGenerator } from "@/lib/main";
import { Types } from "mongoose";
import { rateLimit } from "@/lib/rate-limit";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";


export const sendVerificationCode = async (userId: Types.ObjectId | string, email?: string) => {
    try {

        const guestId = await getOrCreateGuestId();
        const { error } = rateLimit(guestId, false);
        if (error) return errorResponse(error)
        await connectToDatabase();
        const validId = new Types.ObjectId(userId);
        let validEmail = email;
        if (!validEmail) {
            const user = await findUserById(validId);
            if (!user) return errorResponse(ERROR_MESSAGES.AUTH_INCORRECT_EMAIL);
            if (user.isVerified) return errorResponse("Email has already been verified");
            validEmail = user.email
        }
        const { code, expiresAt } = otpGenerator();



        await upsertVerification({ userId: validId, code, expiresAt });
        const { subject, text, template } = verificationEmailTemplate(code);
        await sendEmail(validEmail, subject, text, template);
        return { success: "Verification code sent to your email", error: null }
    } catch (error) {
        console.error(`Unable to send verification code: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}