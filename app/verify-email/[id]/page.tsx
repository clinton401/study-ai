import type { Metadata } from "next"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export const metadata: Metadata = {
  title: "Verify Email - Confirm Your Account",
  description:
    "Verify your StudyAI account with the OTP code sent to your email. Complete your registration to access AI-powered learning tools.",
  keywords: ["verify email", "OTP verification", "account confirmation", "StudyAI", "email verification"],
  openGraph: { 
    title: "Verify Email | StudyAI",
    description: "Verify your email address to complete your StudyAI account setup and start learning with AI.",
    type: "website",
  },
}

export default function VerifyEmailPage() {
  return <main> <VerifyEmailForm /></main>
}
