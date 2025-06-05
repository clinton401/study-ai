import type { Metadata } from "next";
import { WritingCompanionClient } from "@/components/writing-companion-client";

export const metadata: Metadata = {
  title: "AI Writing Companion ",
  description:
    "Enhance your writing with AI-powered suggestions for grammar, style, tone, and clarity. Real-time writing assistance for students.",
  keywords: [
    "AI writing assistant",
    "grammar checker",
    "writing companion",
    "essay helper",
    "writing improvement",
    "AI proofreader",
  ],
  openGraph: {
    title: "AI Writing Companion - StudyAI",
    description:
      "Enhance your writing with AI-powered suggestions for grammar, style, tone, and clarity.",
    url: "https://studyaii.vercel.app/writing-companion",
    // images: ["/og-writing-companion.jpg"],
  },
  alternates: {
    canonical: "/writing-companion",
  },
};

export default function WritingCompanionPage() {
  return (
    <main>
      <WritingCompanionClient />
    </main>
  );
}
