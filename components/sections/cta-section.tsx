"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="pb-24  pt-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-card shadow-sm px-8 sm:px-16 py-16 text-center space-y-6"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Get started
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start Studying Smarter Today
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Join thousands of students using AI to summarise notes, write
            essays, generate flashcards and quizzes, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white border-0"
            >
              <Link href="/register">
                Sign Up Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/features">View Features</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
