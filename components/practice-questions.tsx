"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuestions } from "@/actions/generate-questions";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { Loader2, FileQuestion, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  showAnswer?: boolean;
}

interface PracticeQuestionsProps {
  content: string;
}

export function PracticeQuestions({ content }: PracticeQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const { createError } = createToast();
  const topRef = useRef<HTMLDivElement | null>(null);

  const generateQuestionsHandler = async () => {
    if (loading) return;
    if (content.length < 200) return createError("Please provide at least 200 characters of text.");
    try {
      setLoading(true);
      setQuestions([]);
      const data = await generateQuestions(content, 20);
      if (!data || !Array.isArray(data.questions)) return createError("Invalid response format");

      const formatted: Question[] = data.questions
        .map((q: Question, idx: number) => {
          if (typeof q.question !== "string" || !Array.isArray(q.options) || typeof q.correctAnswer !== "number") return null;
          return { id: idx + 1, question: q.question, options: q.options, correctAnswer: q.correctAnswer };
        })
        .filter(Boolean) as Question[];

      setQuestions(formatted);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (id: number, index: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, userAnswer: index } : q)));
  };

  const checkAllAnswers = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, showAnswer: true })));
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const answered = questions.filter((q) => q.showAnswer);
  const score = answered.filter((q) => q.userAnswer === q.correctAnswer).length;
  const allChecked = questions.length > 0 && questions[0]?.showAnswer;
  const allAnswered = questions.length > 0 && questions.every((q) => q.userAnswer !== undefined);

  return (
    <div ref={topRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden w-full min-w-0">
      {/* Card header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-8 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
            <FileQuestion className="h-4 w-4 text-background" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight leading-none">Practice Questions</h3>
            {questions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {questions.length} questions
                {allChecked ? ` · ${score}/${questions.length} correct` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {questions.length > 0 && (
            <Button
              onClick={generateQuestionsHandler}
              variant="outline"
              size="sm"
              disabled={loading}
              className="rounded-xl gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              New questions
            </Button>
          )}
          {questions.length === 0 && (
            <Button
              onClick={generateQuestionsHandler}
              size="sm"
              disabled={loading}
              className="rounded-xl gap-1.5"
            >
              {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : "Generate questions"}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {loading && questions.length === 0 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-8 space-y-6 animate-pulse"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-3 bg-muted rounded w-1/2" />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : questions.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center px-4 sm:px-8"
          >
            <FileQuestion className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No questions yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Click &quot;Generate questions&quot; to create a practice quiz from your content.</p>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Score banner */}
            <AnimatePresence>
              {allChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "px-4 sm:px-8 py-4 border-b border-border/60 text-sm font-semibold flex items-start gap-2",
                    score === questions.length
                      ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                      : score >= questions.length / 2
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                  )}
                >
                  <span className="shrink-0 mt-0.5">
                    {score === questions.length ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </span>
                  <span>
                    You scored {score} out of {questions.length}
                    {score === questions.length ? " — perfect!" : score >= questions.length / 2 ? " — good effort!" : " — keep practising!"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question list */}
            <div className="divide-y divide-border/60">
              {questions.map((q, index) => {
                const isCorrect = q.userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className="px-4 sm:px-8 py-6 space-y-4">
                    <p className="text-sm font-semibold leading-snug">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {q.question}
                    </p>

                    <RadioGroup
                      value={q.userAnswer?.toString()}
                      onValueChange={(v) => handleAnswerSelect(q.id, parseInt(v))}
                      disabled={!!q.showAnswer}
                      className="space-y-2"
                    >
                      {q.options.map((option, optIdx) => {
                        const isThis = q.userAnswer === optIdx;
                        const isCorrectOpt = q.correctAnswer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              "flex items-start gap-3 rounded-xl border px-3 sm:px-4 py-2.5 transition-colors",
                              q.showAnswer
                                ? isCorrectOpt
                                  ? "border-green-400/60 bg-green-50 dark:bg-green-950/20"
                                  : isThis && !isCorrect
                                  ? "border-red-400/60 bg-red-50 dark:bg-red-950/20"
                                  : "border-border/40 opacity-50"
                                : isThis
                                ? "border-foreground bg-accent"
                                : "border-border hover:border-foreground/30 hover:bg-accent/50 cursor-pointer"
                            )}
                          >
                            <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-${optIdx}`} className="mt-0.5 shrink-0" />
                            <Label
                              htmlFor={`q${q.id}-${optIdx}`}
                              className={cn(
                                "text-sm cursor-pointer leading-snug",
                                q.showAnswer && isCorrectOpt && "text-green-700 dark:text-green-400 font-medium",
                                q.showAnswer && isThis && !isCorrect && "text-red-700 dark:text-red-400"
                              )}
                            >
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {q.showAnswer && !isCorrect && (
                      <p className="text-xs text-muted-foreground">
                        Correct answer: <span className="font-medium text-green-700 dark:text-green-400">{q.options[q.correctAnswer]}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer CTA */}
            {!allChecked && (
              <div className="px-4 sm:px-8 py-5 border-t border-border/60">
                <Button
                  onClick={checkAllAnswers}
                  disabled={!allAnswered}
                  className="w-full rounded-xl font-semibold"
                  size="lg"
                >
                  Check answers
                </Button>
                {!allAnswered && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Answer all {questions.length} questions to check results
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}