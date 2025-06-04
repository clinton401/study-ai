import User, {IUser, FullUser} from "@/models/user";
import {Types} from "mongoose";
import {ERROR_MESSAGES} from "@/lib/error-messages";


export const findUserByEmail = (email: string): Promise<FullUser | null> => {
   return User.findOne({ email: new RegExp(`^${email}$`, 'i') });
}

export const createUser = (data: Omit<IUser, "updatedAt" | "createdAt" | "isVerified">): Promise<FullUser> => {
    return User.create(data)
}

export const findUserById = (id: Types.ObjectId): Promise<FullUser | null> => {
    return User.findById(id).exec()
}

export const updateUser = async(userId: Types.ObjectId, data: Partial<IUser>) => {
try{
    const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
    if (!updatedUser){
        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR)
    }
    return updatedUser;
}catch(error) {
    throw error
}
}

export const deleteUserById = (id: Types.ObjectId) => User.findByIdAndDelete(id);