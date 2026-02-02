"use server";
import {ERROR_MESSAGES} from "@/lib/error-messages";
import getServerUser from "@/hooks/get-server-user";
import TermPaper from "@/models/term-paper";
import {Types} from "mongoose";
import {errorResponse} from "@/lib/main";
import { rateLimit } from "@/lib/rate-limit";



export const deleteContent = async(id: Types.ObjectId) => {
    try {
        
        const session = await getServerUser();
        if (!session) return errorResponse(ERROR_MESSAGES.UNAUTHORIZED);
        const { error } = await rateLimit(session.id, {}, true, "DELETE_CONTENT");
        if (error) return errorResponse(error);

        const content = await TermPaper.findOne({ _id: id, userId: session.id });
        if (!content) return errorResponse(ERROR_MESSAGES.CONTENT_NOT_FOUND);

        await TermPaper.deleteOne({ _id: id });
        return { error: null, success: "Content deleted successfully" };


    }catch(error){
        console.error(`Unable to delete content: ${error}`);
        return errorResponse(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
}