"use server"
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { validatePassword } from "@/lib/password-utils";
import { connectToDatabase } from "@/lib/db";
import { findUserByEmail } from "@/data/user";
import { signIn } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { AuthError } from "next-auth";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { errorResponse } from "@/lib/main";
import { sendVerificationCode } from "./send-verification-code";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import getOrCreateGuestId from "@/hooks/get-or-create-guest-id";

export const login = async (data: LoginFormData): Promise<{ error: string | null, success: string | null; redirect: string | null}> => {
    try {
        const result = loginSchema.safeParse(data);
        if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS, { redirect: null });
        const userId = await getOrCreateGuestId();
        const { error: rateLimitError } = rateLimit(userId, false);
        if (rateLimitError) return errorResponse(rateLimitError, { redirect: null });
        await connectToDatabase();
        const { email, password } = result.data;

        const user = await findUserByEmail(email);
        if (!user) return errorResponse(ERROR_MESSAGES.AUTH_INCORRECT_EMAIL, { redirect: null });
        if (!user.password) return errorResponse(ERROR_MESSAGES.PASSWORD_NOT_SET, { redirect: null })
        if (!user.isVerified) {
            const { error } = await sendVerificationCode(user._id, user.email);
            if (error) return errorResponse(error, { redirect: null });
            return {
                success: "Please verify your email before signing in. A verification code has been sent to your email address",
                redirect: `/verify-email/${user._id}`,
                error: null
            }
        }
        const isPasswordValid = await validatePassword(password, user.password);
        if (!isPasswordValid) return errorResponse(ERROR_MESSAGES.AUTH_INCORRECT_PASSWORD);

        const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        if (!signInResult || signInResult.error) return errorResponse("Login failed. Please try again.", { redirect: null });

        return {
            success: "Login successful.",
            error: null,
            redirect: DEFAULT_LOGIN_REDIRECT
        }


    } catch (error) {
        console.error(`Errror while signing in: ${error}`);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return errorResponse(ERROR_MESSAGES.AUTH_INCORRECT_PASSWORD, { redirect: null });
                default:
                    return errorResponse(ERROR_MESSAGES.UNKNOWN_ERROR, { redirect: null });
            }
        } else {
            return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { redirect: null });
        }
    }
}
