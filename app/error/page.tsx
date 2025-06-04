import { FC } from "react";
import { SigninErrorPage } from "@/components/auth/sign-in-error-page";

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In Error",
  description:
    "There was a problem signing in to your StudyAI account. Please try again or return to the login page.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/error",
  },
}


const ErrorPage: FC = () => {
return <SigninErrorPage />
}

export default ErrorPage