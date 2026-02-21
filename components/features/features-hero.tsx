"use client";

import { motion } from "framer-motion";

export function FeaturesHero() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-5"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Features
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[1.1]">
            6 Powerful AI Tools
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything a student needs - summarise notes, generate essays,
            create flashcards and quizzes, rephrase text, and polish your
            writing with AI.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
