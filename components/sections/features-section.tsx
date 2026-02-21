"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Wand2,
  LayoutDashboard,
  FileQuestion,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Wand2,
    title: "Content Generator",
    description:
      "Generate essays, letters, and written content with customizable tone and length.",
    href: "/content-generator",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    icon: PenTool,
    title: "Writing Companion",
    description:
      "Fix grammar, adjust tone, and get real-time writing suggestions to polish any text.",
    href: "/writing-companion",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    icon: BookOpen,
    title: "Note Summariser",
    description:
      "Upload notes or PDFs and get smart, concise summaries that capture the key points.",
    href: "/ai-study-tools",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: LayoutDashboard,
    title: "Flashcard Generator",
    description:
      "Turn any text or document into ready-to-study flashcards with a single click.",
    href: "/ai-study-tools",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/20",
  },
  {
    icon: FileQuestion,
    title: "Quiz Generator",
    description:
      "Automatically create multiple-choice quizzes from your notes to test your knowledge.",
    href: "/ai-study-tools",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    icon: RefreshCw,
    title: "Text Rephraser",
    description:
      "Rephrase any passage in formal, friendly, academic, or casual tone instantly.",
    href: "/writing-companion",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-4"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Built for students
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything You Need to Study Smarter
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Six AI-powered tools designed to cover every part of the learning
            process - from notes to essays to exam prep.
          </p>
        </motion.div>

        {/* 2-col on md, 3-col on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(
            ({ icon: Icon, title, description, href, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true }}
              >
                <Link href={href} className="group block h-full">
                  <div className="h-full rounded-2xl border border-border bg-card shadow-sm px-6 py-6 space-y-4 hover:border-foreground/25 hover:shadow-md transition-all duration-200">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight mb-1.5">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors group-hover:gap-2">
                      Try Now <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
