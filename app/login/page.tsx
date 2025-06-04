import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your StudyAI account to access AI-powered study tools, note summarizer, quiz generator, and writing companion.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
}

export default function LoginPage() {
  return <LoginForm />;
}
