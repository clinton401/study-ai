import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { connectToDatabase } from "@/lib/db";
import { Types } from "mongoose";
import { Session } from "next-auth";

import { findUserByEmail, findUserById, updateUser, createUser } from "@/data/user";
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // console.log({user, account})
      if (!user || !user.email) return false
      await connectToDatabase();
      if (account?.provider === "credentials") {
        const existingUser = await findUserByEmail(user.email || "");
        if (
          !existingUser ||
          existingUser.isVerified === false
        )
          return false;
        return true;
      }

      if (account?.provider && account.provider !== "credentials") {



        const existingUser = await findUserByEmail(user.email)

        if (existingUser) {

          if (!existingUser.isVerified) {
            await updateUser(existingUser._id, { isVerified: true })
            return true;
          }

          return true
        }

        const data = {
          email: user.email,
          name: user?.name || "User",


        }
        await createUser(data)
        return true;
      }

      return true;
    },
    async jwt({ token }) {
      // console.log({token})
      await connectToDatabase();
      let user;

      if (token.sub && Types.ObjectId.isValid(token.sub)) {
        const id = new Types.ObjectId(token.sub);
        user = await findUserById(id);
      } else if (token.email) {
        user = await findUserByEmail(token.email);
      }

      if (user) {
        token.email = user.email
        token.sub = user._id.toString();
        token.name = user.name;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.isPasswordAvailable = !!user.password;
      }

      return token;
    },
    async session({ token, session }: { session: Session; token: any }) {
      // console.log({token, session})
      if (!token || !session?.user) return session;
      if (token.email) {
        session.user.email = token.email
      }
      if (token.sub) {
        session.user.id = token.sub;
      }



      if (token.name) {
        session.user.name = token.name;
      }

      if (token.createdAt) {
        session.user.createdAt = token.createdAt;
      }

      if (token.updatedAt) {
        session.user.updatedAt = token.updatedAt;
      }

      if (token.isPasswordAvailable !== undefined) {
        session.user.isPasswordAvailable = token.isPasswordAvailable;
      }
      // console.log({newSession: session})
      return session;
    },
  },
  ...authConfig,
});
