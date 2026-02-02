"use server";


import { findUserByEmail } from "@/data/user";
import { upsertPasswordReset } from "@/data/password-reset";
import { connectToDatabase } from "@/lib/db";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { resetPasswordEmailTemplate } from "@/lib/html-templates";
import { sendEmail } from "@/lib/mailer";
import { errorResponse, otpGenerator } from "@/lib/main";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";


export const sendPasswordResetCode = async (data: ForgotPasswordFormData, domain: string) => {
    const result = forgotPasswordSchema.safeParse(data);
    if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS);
    try {
        
        const guestId = await getOrCreateGuestId();
        const { error } = await rateLimit(guestId, {}, false, "AUTH");
        if (error) return errorResponse(error);
        await connectToDatabase();
        const { email } = result.data;

        const user = await findUserByEmail(email);
        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);
        const userId = user._id;

        const { code, expiresAt } = otpGenerator(true, 16);



        await upsertPasswordReset({ userId, code, expiresAt });
        const resendLink = `${domain}/reset-password/${userId}/${code}`
        const { subject, text, template } = resetPasswordEmailTemplate(resendLink);
        await sendEmail(email, subject, text, template);
        return { success: "Password reset link sent to your email", error: null }
    } catch (error) {
        console.error(`Unable to send PasswordReset code: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}