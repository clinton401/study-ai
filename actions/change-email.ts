"use server"
import { connectToDatabase } from "@/lib/db";
import { findUserByEmail, findUserById, updateUser } from "@/data/user";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { ChangeEmailFormData, changeEmailSchema } from "@/lib/validations/settings";

export const changeEmail = async (data: ChangeEmailFormData) => {
    try {
        const session = await getServerUser();
        if (!session) {
            return errorResponse(ERROR_MESSAGES.UNAUTHORIZED);
        }
        const result = changeEmailSchema.safeParse(data);
        if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS);
        const { error } = await rateLimit(session.id, {}, true, "SETTINGS");
        if (error) return errorResponse(error);
        const { newEmail } = result.data;
        await connectToDatabase();
        const [user, emailExists] = await Promise.all([
            findUserById(session.id),
            findUserByEmail(newEmail)
        ]);



        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);
        if (emailExists) return errorResponse(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);

        await updateUser(session.id, { email: newEmail });

        return { error: null, success: "Email updated successfully" }

    } catch (error) {
        console.error(`Unable to change email: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}
