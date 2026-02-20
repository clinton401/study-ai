"use client";

import { ArrowLeft, CheckCircle, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyExport } from "./copy-exports";
import { FullUserQuestion as QuizSet } from "@/models/user-questions-schema";
import { CollapsibleText } from "@/components/collapsible-text";
import { cn } from "@/lib/utils";

interface QuizViewerProps {
  quizSet: QuizSet;
  onClose: () => void;
}

export function QuizViewer({ quizSet, onClose }: QuizViewerProps) {
  const quizContent = quizSet.questions
    .map((q, i) => {
      const options = q.options
        .map((opt, oi) =>
          `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === q.correctAnswer ? " (Correct)" : ""}`
        )
        .join("\n");
      return `${i + 1}. ${q.question}\n${options}`;
    })
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
              <h1 className="text-base font-bold tracking-tight leading-none">Quiz Set</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                  {quizSet.count} questions
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(quizSet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <CopyExport content={quizContent} filename={quizSet.originalText.slice(0, 20)} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
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
                <CollapsibleText text={quizSet.originalText} className="text-sm text-muted-foreground leading-relaxed" />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {quizSet.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                >
                  {/* Question */}
                  <div className="px-5 py-4 border-b border-border/60 flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground mt-0.5">
                      <FileQuestion className="h-3 w-3 text-background" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <p className="text-sm font-semibold mt-1 leading-snug">{question.question}</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="px-5 py-4 space-y-2">
                    {question.options.map((option, oi) => {
                      const isCorrect = oi === question.correctAnswer;
                      return (
                        <div
                          key={oi}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
                            isCorrect
                              ? "border-green-400/60 bg-green-50 dark:bg-green-950/20"
                              : "border-border/40 opacity-60"
                          )}
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">
                            {String.fromCharCode(65 + oi)}
                          </div>
                          <span className={cn(
                            "flex-1 text-sm",
                            isCorrect && "font-medium text-green-700 dark:text-green-400"
                          )}>
                            {option}
                          </span>
                          {isCorrect && (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}