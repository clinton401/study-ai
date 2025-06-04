

import { DefaultSession } from "next-auth";
import {Types} from "mongoose"

declare module "next-auth" {
  interface Session {
    user: {
      id: Types.ObjectId;
      name: string;
      email: string;
      createdAt?: Date;
      updatedAt?: Date;
      isPasswordAvailable?: boolean;
    } & DefaultSession["user"];
  }
}
