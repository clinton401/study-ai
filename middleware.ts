import authConfig from "@/auth.config";
import NextAuth from "next-auth";
const { auth } = NextAuth(authConfig);

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
} from "@/routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isAuthRoute = !!authRoutes.find(route => nextUrl.pathname.startsWith(route));;

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectUrl = DEFAULT_LOGIN_REDIRECT;
      return Response.redirect(new URL(redirectUrl, nextUrl));
    }

    return;
  }



  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
  // runtime: "nodejs",
  // unstable_allowDynamic: [
  //     // allows a single file
  //     "/src/db/lib/db",
  //     // use a glob to allow anything in the function-bind 3rd party module
  //     "/node_modules/mongoose/dist/**",
  // ]
};
