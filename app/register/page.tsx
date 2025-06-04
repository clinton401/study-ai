import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create your StudyAI account to access AI-powered study tools. Join thousands of students studying smarter with AI.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/register",
  },
}

export default function RegisterPage() {
  return <RegisterForm />;
}
