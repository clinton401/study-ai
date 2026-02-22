"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Loader2, BookOpen, RefreshCw } from "lucide-react";
import { generateFlashcards } from "@/actions/generate-flashcards";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface FlashcardCarouselProps {
  content: string;
}

export function FlashcardCarousel({ content }: FlashcardCarouselProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createError } = createToast();

  const generate = async () => {
    if (loading) return;
    if (content.length < 200) return createError("Please provide at least 200 characters of text.");
    try {
      setLoading(true);
      const data = await generateFlashcards(content, 20);
      if (!data || data.error || !Array.isArray(data.flashcards)) {
        return createError(data?.error || "Invalid response format");
      }

      const formatted: Flashcard[] = data.flashcards
        .map((fc: Flashcard, idx: number) => {
          if (typeof fc.front !== "string" || typeof fc.back !== "string") return null;
          const front = fc.front.trim();
          const back = fc.back.trim();
          if (!front || !back) return null;
          return { id: idx + 1, front, back };
        })
        .filter(Boolean) as Flashcard[];

      if (!formatted.length) return createError("No valid flashcards returned");
      setFlashcards(formatted);
      setCurrent(0);
      setFlipped(false);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const next = () => { setCurrent((p) => (p + 1) % flashcards.length); setFlipped(false); };
  const prev = () => { setCurrent((p) => (p - 1 + flashcards.length) % flashcards.length); setFlipped(false); };

  const card = flashcards[current];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-8 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
            <BookOpen className="h-4 w-4 text-background" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight leading-none">Flashcards</h3>
            {flashcards.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {current + 1} of {flashcards.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {flashcards.length > 0 && (
            <Button
              onClick={generate}
              variant="outline"
              size="sm"
              disabled={loading}
              className="rounded-xl gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              New deck
            </Button>
          )}
          {flashcards.length === 0 && (
            <Button
              onClick={generate}
              size="sm"
              disabled={loading}
              className="rounded-xl gap-1.5"
            >
              {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : "Generate flashcards"}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {loading && flashcards.length === 0 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-8 animate-pulse"
          >
            <div className="rounded-xl border border-border bg-muted/40 h-48 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        ) : flashcards.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center px-4 sm:px-8"
          >
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No flashcards yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Generate a deck to start studying.</p>
          </motion.div>
        ) : (
          <motion.div
            key="deck"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="p-4 sm:p-8 space-y-6"
          >
            {/* The card itself */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative cursor-pointer select-none rounded-2xl border border-border bg-background min-h-52 flex flex-col items-center justify-center p-6 sm:p-8 text-center gap-4 transition-all hover:border-foreground/30 hover:shadow-md active:scale-[0.99]"
              style={{ perspective: "1000px" }}
            >
              {/* Side label */}
              <span className={cn(
                "absolute top-3 left-3 sm:top-4 sm:left-4 text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md",
                flipped
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}>
                {flipped ? "Answer" : "Question"}
              </span>

              <AnimatePresence mode="wait">
                <motion.p
                  key={flipped ? "back" : "front"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-base font-medium leading-relaxed mt-4"
                >
                  {flipped ? card.back : card.front}
                </motion.p>
              </AnimatePresence>

              <div className="absolute bottom-3 sm:bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="h-3 w-3" />
                Click to flip
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prev}
                className="rounded-xl gap-1 shrink-0"
                disabled={flashcards.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1 flex-wrap justify-center flex-1 overflow-hidden">
                {flashcards.slice(0, 20).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCurrent(i); setFlipped(false); }}
                    className={cn(
                      "rounded-full transition-all shrink-0",
                      i === current
                        ? "w-4 h-2 bg-foreground"
                        : "w-2 h-2 bg-muted hover:bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={next}
                className="rounded-xl gap-1 shrink-0"
                disabled={flashcards.length <= 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}