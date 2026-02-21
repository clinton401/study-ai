"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  PenTool,
  Wand2,
  LayoutDashboard,
  FileQuestion,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const cards = [
  {
    icon: Wand2,
    label: "Content Generator",
    href: "/content-generator",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    icon: PenTool,
    label: "Writing Companion",
    href: "/writing-companion",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    icon: BookOpen,
    label: "Note Summariser",
    href: "/ai-study-tools",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: LayoutDashboard,
    label: "Flashcard Generator",
    href: "/ai-study-tools",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/20",
  },
  {
    icon: FileQuestion,
    label: "Quiz Generator",
    href: "/ai-study-tools",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    icon: RefreshCw,
    label: "Text Rephraser",
    href: "/writing-companion",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/20",
  },
];

export function HeroSection() {
  const { push } = useRouter();

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto space-y-6 mb-16"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            AI Study Tools
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Study Smarter
            <br className="hidden sm:block" /> with AI
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A one-stop learning assistant for students - summarise notes,
            generate essays, create flashcards and quizzes, and improve your
            writing instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white border-0"
            >
              <Link href="/content-generator">
                Explore Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/features">View Features</Link>
            </Button>
          </div>
        </motion.div>

        {/* 6 tool cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          {cards.map(({ icon: Icon, label, href, color, bg }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => push(href)}
              className="rounded-2xl border border-border bg-card shadow-sm px-5 py-5 text-left hover:border-foreground/25 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-3`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-tight">
                {label}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
