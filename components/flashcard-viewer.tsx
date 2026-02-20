"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, LayoutDashboard } from "lucide-react";
import { FullUserFlashcard as FlashcardSet } from "@/models/user-flashcards-schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyExport } from "./copy-exports";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CollapsibleText } from "@/components/collapsible-text";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet;
  onClose: () => void;
}

export function FlashcardViewer({ flashcardSet, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<"study" | "list">("study");

  const card = flashcardSet.flashcards[currentIndex];
  const total = flashcardSet.flashcards.length;

  const next = () => { if (currentIndex < total - 1) { setCurrentIndex(i => i + 1); setIsFlipped(false); } };
  const prev = () => { if (currentIndex > 0) { setCurrentIndex(i => i - 1); setIsFlipped(false); } };

  const flashcardContent = flashcardSet.flashcards
    .map((c, i) => `${i + 1}. Q: ${c.front}\n   A: ${c.back}`)
    .join("\n\n");

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight leading-none">Flashcard Set</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                  {total} cards
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(flashcardSet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as "study" | "list")}
              className="rounded-xl border border-border p-1 h-8"
            >
              <ToggleGroupItem value="study" className="rounded-lg text-xs h-6 px-3">Study</ToggleGroupItem>
              <ToggleGroupItem value="list"  className="rounded-lg text-xs h-6 px-3">List</ToggleGroupItem>
            </ToggleGroup>
            <CopyExport content={flashcardContent} filename={flashcardSet.originalText.slice(0, 20)} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "study" ? (
          /* ── Study mode ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-8 gap-6">
            {/* Progress */}
            <div className="flex items-center justify-between w-full max-w-2xl">
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentIndex + 1} / {total}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFlipped(false)}
                className="rounded-xl gap-1.5 text-xs h-7"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>

            {/* Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full max-w-2xl min-h-[260px] cursor-pointer select-none rounded-2xl border border-border bg-card shadow-sm flex flex-col items-center justify-center p-6 sm:p-10 text-center gap-4 hover:border-foreground/30 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <span className={cn(
                "absolute top-4 left-4 text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md",
                isFlipped ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              )}>
                {isFlipped ? "Answer" : "Question"}
              </span>

              <AnimatePresence mode="wait">
                <motion.p
                  key={isFlipped ? "back" : "front"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="text-base font-medium leading-relaxed"
                >
                  {isFlipped ? card.back : card.front}
                </motion.p>
              </AnimatePresence>

              <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="h-3 w-3" /> Click to flip
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-2xl gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={currentIndex === 0}
                className="rounded-xl gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>

              <div className="flex items-center gap-1 flex-wrap justify-center flex-1 overflow-hidden">
                {flashcardSet.flashcards.slice(0, 20).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCurrentIndex(i); setIsFlipped(false); }}
                    className={cn(
                      "rounded-full transition-all shrink-0",
                      i === currentIndex ? "w-4 h-2 bg-foreground" : "w-2 h-2 bg-muted hover:bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={currentIndex === total - 1}
                className="rounded-xl gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* ── List mode ──────────────────────────────────────────────────── */
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
              {/* Original text */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border/60">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Original Text
                  </span>
                </div>
                <div className="px-5 py-4">
                  <CollapsibleText text={flashcardSet.originalText} className="text-sm text-muted-foreground leading-relaxed" />
                </div>
              </div>

              {/* Card list */}
              <div className="space-y-3">
                {flashcardSet.flashcards.map((fc, i) => (
                  <div
                    key={fc.id}
                    className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-border/60">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground">
                        <LayoutDashboard className="h-3 w-3 text-background" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Card {i + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                      <div className="px-5 py-4 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Question</p>
                        <p className="text-sm font-medium leading-snug">{fc.front}</p>
                      </div>
                      <div className="px-5 py-4 space-y-1 bg-green-50/50 dark:bg-green-950/10">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Answer</p>
                        <p className="text-sm leading-snug text-green-700 dark:text-green-400">{fc.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}