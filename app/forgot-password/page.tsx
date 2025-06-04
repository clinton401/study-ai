import type { Metadata } from "next"
import ForgotPasswordClientPage from "./ForgotPasswordClientPage"

export const metadata: Metadata = {
  title: "Forgot Password  - Reset Your Password",
  description:
    "Reset your StudyAI account password. Enter your email to receive a password reset link and regain access to your AI-powered learning tools.",
  keywords: ["forgot password", "reset password", "account recovery", "StudyAI", "password help"],
  openGraph: {
    title: "Forgot Password | StudyAI",
    description: "Reset your StudyAI account password and get back to learning with AI-powered tools.",
    type: "website",
  },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientPage />
}
