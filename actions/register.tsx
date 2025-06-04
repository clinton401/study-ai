"use server"

import {connectToDatabase} from "@/lib/db";
import {findUserByEmail, createUser} from "@/data/user";
import {errorResponse} from "@/lib/main";
import { RegisterFormData, registerSchema } from "@/lib/validations/auth";
import {ERROR_MESSAGES} from "@/lib/error-messages";
import { sendVerificationCode } from "./send-verification-code";
import { rateLimit } from "@/lib/rate-limit";
import getUserIpAddress from "@/hooks/get-user-ip-address";



export const register = async(values: RegisterFormData) => {
try{
    const result = registerSchema.safeParse(values);
    if (!result.success) return errorResponse(ERROR_MESSAGES.INVALID_FIELDS, {redirect: null});
    const userIp = await getUserIpAddress();
    const { error: rateLimitError } = rateLimit(userIp, false);
        if (rateLimitError) return errorResponse(rateLimitError, { redirect: null });
    await connectToDatabase();
    const {email, password, name} = result.data;

    const userExists = await findUserByEmail(email);
    if (userExists) return errorResponse(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, {redirect: null});
    
    const user = await createUser({ email, password, name });

    const { error } = await sendVerificationCode(user._id);
    if(error) return errorResponse(error, {redirect: null});

    return {
        error: null,
        success:"User created successfully!. Verification code sent to your email",
        redirect: `/verify-email/${user._id}`
    }
   


}catch(error){
    console.error(`Unable to register user: ${error}`);
    return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, {redirect: null});

}
}

