import {Types} from "mongoose";

export type SessionType = {
    id: Types.ObjectId;
    name: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
    isPasswordAvailable?: boolean;
}