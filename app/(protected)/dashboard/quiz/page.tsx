import {QuizPageClient} from "@/components/quiz-page-client"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizzes",
  description:
    "Create, browse, and manage your AI-generated quizzes with StudyAI.",
  keywords: [
    "AI quizzes",
    "study quizzes",
    "interactive learning",
    "StudyAI quizzes",
    "practice tests",
  ],
  openGraph: {
    title: "Quizzes",
    description:
      "Access and manage all your AI-generated quizzes in one place with StudyAI.",
    url: "https://studyaii.vercel.app/dashboard/quiz",
  },
  alternates: {
    canonical: "/dashboard/quiz",
  },
};


export default function QuizPage() {
  return (
    <QuizPageClient />
  );
}
