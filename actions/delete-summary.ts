  "use server";
  import {ERROR_MESSAGES} from "@/lib/error-messages";
  import getServerUser from "@/hooks/get-server-user";
  import UserSummary from "@/models/user-summary";
  import {Types} from "mongoose";
  import {errorResponse} from "@/lib/main";
  import { rateLimit } from "@/lib/rate-limit";
  
  
  
  export const deleteSummary = async(id: Types.ObjectId) => {
      try {
          
          const session = await getServerUser();
          if (!session) return errorResponse(ERROR_MESSAGES.UNAUTHORIZED);
          const { error } = rateLimit(session.id, true);
          if (error) return errorResponse(error);
  
          const summary = await UserSummary.findOne({ _id: id, userId: session.id });
          if (!summary) return errorResponse(ERROR_MESSAGES.CONTENT_NOT_FOUND);
  
          await UserSummary.deleteOne({ _id: id });
          return { error: null, success: "Content deleted successfully" };
  
  
      }catch(error){
          console.error(`Unable to delete content: ${error}`);
          return errorResponse(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
  }