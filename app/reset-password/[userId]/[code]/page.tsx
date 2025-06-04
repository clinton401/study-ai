import {FC} from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {Metadata} from "next";
export const metadata: Metadata = {
    title: "Reset Your Password",
    description:
      "Reset your StudyAI account password. Enter your email to receive a password reset link and regain access to your AI-powered learning tools.",
    keywords: ["forgot password", "reset password", "account recovery", "StudyAI", "password help"],
    openGraph: {
      title: "Forgot Password | StudyAI",
      description: "Reset your StudyAI account password and get back to learning with AI-powered tools.",
      type: "website",
    },
  }

const ResetPasswordPage: FC = () => {
    return <ResetPasswordForm />
}
export default ResetPasswordPage;