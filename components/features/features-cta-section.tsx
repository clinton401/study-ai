"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FeaturesCTASection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-card shadow-sm px-8 sm:px-16 py-16 text-center space-y-6"
        >
          <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ready to start?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Experience All 6 Tools for Free
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Create an account and start using every AI-powered tool today - no
            credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-xl gap-2 "
            >
              <Link href="/register">
                Sign Up Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/ai-study-tools">Try Study Tools</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
