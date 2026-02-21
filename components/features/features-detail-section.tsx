"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Wand2,
  LayoutDashboard,
  FileQuestion,
  RefreshCw,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: Wand2,
    title: "Content Generator",
    description:
      "Generate essays, letters, and written content with AI. Choose your type, tone, and length for perfect results every time.",
    benefits: [
      "Create essays, term papers, and letters instantly",
      "Multiple tone options - formal, academic, casual, friendly",
      "Customizable length from 500 to 2000+ words",
      "Copy and export your generated content",
    ],
    accentColor: "from-green-500 to-emerald-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    href: "/content-generator",
  },
  {
    icon: PenTool,
    title: "Writing Companion",
    description:
      "Enhance your writing with intelligent grammar fixes, style suggestions, and tone adjustments in real time.",
    benefits: [
      "Real-time grammar and spell checking",
      "Tone adjustment across four styles",
      "Sentence restructuring and clarity improvements",
      "Text-to-speech to hear your writing read aloud",
    ],
    accentColor: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    href: "/writing-companion",
  },
  {
    icon: RefreshCw,
    title: "Text Rephraser",
    description:
      "Rephrase any passage in seconds. Adjust the tone without losing the original meaning.",
    benefits: [
      "Four tone modes - formal, friendly, academic, casual",
      "Preserves full meaning and coverage",
      "Works on paragraphs, sections, or entire documents",
      "Accept or undo rephrased output instantly",
    ],
    accentColor: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    href: "/writing-companion",
  },
  {
    icon: BookOpen,
    title: "Note Summariser",
    description:
      "Transform lengthy notes and PDFs into concise, actionable summaries that capture only the key points.",
    benefits: [
      "Upload PDFs, Word docs, or paste text directly",
      "AI identifies and extracts key concepts",
      "Customizable summary length - short, medium, or long",
      "Export or copy the summary with one click",
    ],
    accentColor: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    href: "/ai-study-tools",
  },
  {
    icon: LayoutDashboard,
    title: "Flashcard Generator",
    description:
      "Turn any text, notes, or document into a ready-to-study flashcard deck automatically.",
    benefits: [
      "Generates front/back flashcards from any content",
      "Study mode with flip animations",
      "List view to scan all cards at once",
      "Export cards for use in other apps",
    ],
    accentColor: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    href: "/ai-study-tools",
  },
  {
    icon: FileQuestion,
    title: "Quiz Generator",
    description:
      "Automatically create multiple-choice quizzes from your notes to actively test your knowledge.",
    benefits: [
      "Generates 5–25 questions from any content",
      "4 options per question with one correct answer",
      "Instant feedback with correct answer reveal",
      "Score tracking to measure your progress",
    ],
    accentColor: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    href: "/ai-study-tools",
  },
];

export function FeaturesDetailSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-28">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text */}
              <div className="space-y-6">
                <div
                  className={`inline-flex bg-gradient-to-r ${feature.accentColor} p-3 rounded-2xl`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-4.5 w-4.5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="sm"
                  className={`rounded-xl gap-1.5 bg-gradient-to-r ${feature.accentColor} hover:opacity-90 text-white border-0`}
                >
                  <Link href={feature.href}>
                    Try {feature.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Visual */}
              <div
                className={`rounded-3xl ${feature.bg} border border-border/60 p-10 flex items-center justify-center min-h-[260px]`}
              >
                <div className="space-y-6 w-full max-w-xs">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.accentColor} mx-auto shadow-md`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2 bg-foreground/10 rounded-full w-full" />
                    <div className="h-2 bg-foreground/10 rounded-full w-4/5" />
                    <div className="h-2 bg-foreground/10 rounded-full w-3/5" />
                    <div className="h-2 bg-foreground/10 rounded-full w-4/5" />
                    <div className="h-2 bg-foreground/10 rounded-full w-2/5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
