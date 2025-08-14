import type { Metadata } from "next";
import { ContentGeneratorClient } from "@/components/content-generator-client"

export const metadata: Metadata = {
  title: "AI Content Generator ",
  description:
    "Generate essays, letters, and written content with AI. Choose your type, tone, and length to create high-quality written content instantly.",
  keywords: [
    "AI content generator",
    "essay generator",
    "letter generator",
    "AI writing",
    "academic writing",
    "content creation",
  ],
  openGraph: {
    title: "AI Content Generator ",
    description:
      "Generate essays, letters, and written content with AI. Customize tone, length, and style.",
    url: "https://studyaii.vercel.app/content-generator",
    // images: ["/og-content-generator.jpg"],
  },
  alternates: {
    canonical: "/content-generator",
  },
};

export default function ContentGeneratorPage() {
  return (
      <main>
        <ContentGeneratorClient />
      </main>
  )
}
