"use server";

import { cookies } from "next/headers";
import  {Types} from "mongoose";

const getOrCreateGuestId = async (): Promise<Types.ObjectId> => {
  const cookieStore = await cookies();

  let guestId = cookieStore.get("guestId")?.value;

  if (!guestId || !Types.ObjectId.isValid(guestId)) {
    guestId = new Types.ObjectId().toHexString();
    cookieStore.set("guestId", guestId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, 
    });
  }

    return new Types.ObjectId(guestId);

};

export default getOrCreateGuestId;
