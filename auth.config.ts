import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google"
import { loginSchema } from "@/lib/validations/auth";

import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { validatePassword } from "@/lib/password-utils";
import { findUserByEmail } from "@/data/user";


export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    Credentials({
      async authorize(credentials) {
        await connectToDatabase();
        const validatedFields = loginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          // console.log({ email, password })
          const user = await findUserByEmail(email);
          // console.log({ user });
          if (!user || !user.password) return null;
          const isValid = await validatePassword(password, user.password);
          // console.log({ isValid })
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
