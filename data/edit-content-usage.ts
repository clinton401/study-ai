import EditContent from "@/models/edit-content-schema";
import { Types } from "mongoose";

export const countEditContentDailyUsage = (userId: Types.ObjectId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    return EditContent.countDocuments({
        userId,
        createdAt: { $gte: startOfDay },
      });
}
export const createEditContent= (userId: Types.ObjectId) => {
return EditContent.create({ userId });
}

