import type { Metadata } from "next"
import { AIStudyToolsClient } from "@/components/ai-study-tools-client"

export const metadata: Metadata = {
  title: "AI Study Tools - StudyAI",
  description:
    "Upload your notes and get AI-powered summaries and practice quizzes instantly. Support for PDF, DOCX, and text files.",
  keywords: [
    "AI study tools",
    "note summarizer",
    "quiz generator",
    "study assistant",
    "PDF summarizer",
    "practice questions",
  ],
  openGraph: {
    title: "AI Study Tools - StudyAI",
    description:
      "Upload your notes and get AI-powered summaries and practice quizzes instantly.",
    url: "https://studyaii.vercel.app/ai-study-tools",
    // images: ["/og-ai-study-tools.jpg"],
  },
  alternates: {
    canonical: "/ai-study-tools",
  },
};

export default function AIStudyToolsPage() {
  return (
      <main>
        <AIStudyToolsClient />
      </main>
  )
}
