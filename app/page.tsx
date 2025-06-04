import type { Metadata } from "next"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { CTASection } from "@/components/sections/cta-section"

export const metadata: Metadata = {
  title: "StudyAI - Study Smarter with AI",
  description:
    "Transform your learning with AI-powered tools. Summarize notes, generate quizzes, and improve your writing instantly.",
  openGraph: {
    title: "StudyAI - Study Smarter with AI",
    description:
      "Transform your learning with AI-powered tools. Summarize notes, generate quizzes, and improve your writing instantly.",
    url: "https://studyaii.vercel.app",
    // images: ["/og-home.p"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  
  return (
    <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
  )
}
