"use server"
import { connectToDatabase } from "@/lib/db";
import {  findUserById, updateUser } from "@/data/user";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limit";
import { ChangePasswordFormData, changePasswordSchema } from "@/lib/validations/settings";
import { hashPassword, validatePassword } from "@/lib/password-utils";

export const updatePassword = async (data: ChangePasswordFormData) => {
    try {
        const session = await getServerUser();
         if  (!session) {
            return errorResponse(ERROR_MESSAGES.UNAUTHORIZED);
        }
        const result = changePasswordSchema.safeParse(data);
        if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS);
        const { error } = rateLimit(session.id, true);
        if (error) return errorResponse(error);
        const { currentPassword, newPassword } = result.data;
        await connectToDatabase();
        const user = await findUserById(session.id)



        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);
        
        if (!user.password) return errorResponse(ERROR_MESSAGES.PASSWORD_NOT_SET);

        const [isOldPasswordCorrect, isPasswordTheSameAsLast] = await  Promise.all([
            validatePassword(currentPassword, user.password),
            validatePassword(newPassword, user.password),

            ]);
        
            if(!isOldPasswordCorrect) return errorResponse("Current password is incorrect")
        if (isPasswordTheSameAsLast) return errorResponse(ERROR_MESSAGES.SAME_AS_OLD_PASSWORD);

        const hashedPassword = await hashPassword(newPassword);
        await updateUser(session.id, { password: hashedPassword });


        return { error: null, success: "Password updated successfully" }

    } catch (error) {
        console.error(`Unable to update password: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
}
