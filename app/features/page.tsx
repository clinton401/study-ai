import type { Metadata } from "next"
import { FeaturesHero } from "@/components/features/features-hero"
import { FeaturesDetailSection } from "@/components/features/features-detail-section"
import { HowItWorksSection } from "@/components/features/how-it-works-section"
import { FeaturesCTASection } from "@/components/features/features-cta-section"

export const metadata: Metadata = {
  title: "Features - StudyAI",
  description:
    "Discover powerful AI-powered learning tools: Note Summarizer, Quiz Generator, and Writing Companion. Transform your study experience with advanced AI technology.",
  keywords: [
    "AI study features",
    "note summarizer",
    "quiz generator",
    "writing companion",
    "study tools",
    "AI learning platform",
  ],
  openGraph: {
    title: "Features - StudyAI",
    description: "Discover powerful AI-powered learning tools: Note Summarizer, Quiz Generator, and Writing Companion.",
    url: "https://studyaii.vercel.app/features",
    // images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/features",
  },
}

// Server Component - handles metadata and layout
export default function FeaturesPage() {
  return (

     <main>
            <FeaturesHero />
            <FeaturesDetailSection />
            {/* <HowItWorksSection /> */}
            <FeaturesCTASection />
          </main>
  )
}
