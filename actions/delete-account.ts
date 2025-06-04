"use server"
import { connectToDatabase } from "@/lib/db";
import {  findUserById, deleteUserById } from "@/data/user";
import { errorResponse } from "@/lib/main";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import getServerUser from "@/hooks/get-server-user";


export const deleteAccount = async () => {

    try{
 const session = await getServerUser();
         if  (!session) {
            return errorResponse(ERROR_MESSAGES.UNAUTHORIZED);
        }


        await connectToDatabase();
        const user = await findUserById(session.id)



        if (!user) return errorResponse(ERROR_MESSAGES.USER_NOT_FOUND);

        await deleteUserById(session.id);

        return {error: null, success: "Account deleted successfully"}
    }catch(error){

        console.error(`Unable to update password: ${error}`);
        return errorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
    
}