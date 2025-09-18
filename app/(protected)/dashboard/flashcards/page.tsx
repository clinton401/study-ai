import { FlashcardPageClient } from "@/components/flashcard-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Create, browse, and manage your AI-generated flashcards with StudyAI.",
  keywords: [
    "AI flashcards",
    "study flashcards",
    "interactive learning",
    "StudyAI flashcards",
    "practice flashcards",
  ],
  openGraph: {
    title: "Flashcards",
    description:
      "Access and manage all your AI-generated flashcards in one place with StudyAI.",
    url: "https://studyaii.vercel.app/dashboard/flashcards",
  },
  alternates: {
    canonical: "/dashboard/flashcards",
  },
};

export default function FlashcardsPage() {
  return <FlashcardPageClient />;
}
