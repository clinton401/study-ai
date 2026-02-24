"use client";

import type React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Brain,
  BookOpen,
  Sparkles,
  Loader2,
  RotateCcw,
  Zap,
  CloudUpload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import createToast from "@/hooks/create-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { extractTextFromDocx, extractTextFromTxt } from "@/lib/extract";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { summarizeText } from "@/actions/summarize-text";
import extractTextFromPDF from "react-pdftotext";
import { validateFileSize } from "@/lib/main";
import { CopyExport } from "./copy-exports";
import { AIDialog } from "@/components/ai-dialog";
import { PracticeQuestions } from "./practice-questions";
import { FlashcardCarousel } from "./flashcard-carousel";
import { AIContentDisplay } from "./ai-content-display";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Length pill ──────────────────────────────────────────────────────────────

interface LengthPillProps {
  value: "short" | "medium" | "long";
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function LengthPill({ label, description, selected, onClick }: LengthPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-border bg-card hover:border-foreground/40 hover:bg-accent"
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={cn("text-xs", selected ? "text-background/70" : "text-muted-foreground")}>
        {description}
      </span>
    </button>
  );
}

// ─── Step label ───────────────────────────────────────────────────────────────

function StepLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-[11px] font-bold">
        {number}
      </span>
      <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIStudyToolsClient() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLength, setSummaryLength] = useState<"medium" | "short" | "long">("medium");
  const [isExtractPending, setIsExtractPending] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { createError } = createToast();

  // ── File handling ─────────────────────────────────────────────────────────

  const getFileType = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type = file.type.toLowerCase();
    if (type.includes("pdf") || ext === "pdf") return "pdf";
    if (type.includes("wordprocessingml") || ext === "docx") return "docx";
    if (type.includes("text") || ext === "txt") return "txt";
    return null;
  };

  const extractText = async (file: File): Promise<{ error: string | null; text: string | null }> => {
    const fileType = getFileType(file);
    if (!fileType) return { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file.", text: null };

    let text: string | null = null;
    switch (fileType) {
      case "pdf": text = await extractTextFromPDF(file); break;
      case "docx": text = await extractTextFromDocx(file); break;
      case "txt": text = await extractTextFromTxt(file); break;
    }

    if (!text) return { error: "No extractable text found. Is the file scanned or empty?", text: null };
    return { text, error: null };
  };

  const processFile = async (file: File) => {
    if (isExtractPending) return createError("A file is still being extracted");
    const { error: sizeError } = validateFileSize(file);
    if (sizeError) return createError(sizeError);
    try {
      setIsExtractPending(true);
      const { error, text } = await extractText(file);
      if (error || !text) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setUploadedFile(file);
      setInputText(text);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsExtractPending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setInputText("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Summarize ─────────────────────────────────────────────────────────────

  const handleGenerateSummary = async () => {
    if (inputText.length < 200) return createError("Text must have at least 200 characters");
    if (inputText.length > 200_000) return createError("Text must have at most 200,000 characters");
    try {
      setIsProcessing(true);
      setSummary("");
      const { error, summary: result } = await summarizeText(inputText, summaryLength);
      if (error || !result) return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setSummary(result);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasContent = inputText.trim().length >= 200;

  const shortenFileName = (name: string, max = 10) => {
  if (name.length <= max) return name
  const ext = name.split(".").pop()
  const base = name.slice(0, max - (ext?.length ?? 0) - 4)
  return `${base}...${ext ? "." + ext : ""}`
}

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Brain className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">
              AI Study Tools
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Summarise · Quiz · Flashcards
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-0 sm:px-6 py-12 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-1 px-4 sm:px-0"
        >
          <h2 className="text-4xl font-bold tracking-tight">Study smarter.</h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            Upload your notes or paste text - then summarise, quiz yourself, or
            generate flashcards instantly.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-8 space-y-8"
        >
          {/* Step 1 — Upload */}
          <div>
            <StepLabel number={1} label="Upload or paste your material" />

            {/* Drop zone */}
            <div
              onClick={() => !isExtractPending && inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative w-full min-w-0 flex flex-col justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all cursor-pointer select-none",
                uploadedFile ? "items-stretch" : "items-center",
                isDragOver
                  ? "border-foreground bg-accent"
                  : uploadedFile
                    ? "border-foreground/40 bg-accent/50"
                    : "border-border hover:border-foreground/40 hover:bg-accent/30",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isExtractPending ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm font-medium">Extracting text…</span>
                </div>
              ) : uploadedFile ? (
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground">
                    <FileText className="h-5 w-5 text-background" />
                  </div>
                  <div className="flex-1  min-w-0">
                    <p className="text-sm font-semibold  truncate">
                      {shortenFileName(uploadedFile.name)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="rounded-md p-1 hover:bg-accent transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
                    <CloudUpload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop a file or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, DOCX, TXT — max 10 MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                or paste text
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Text area */}
            <div className="space-y-1.5">
              <Textarea
                placeholder="Paste your notes, textbook content, or any study material here…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="resize-none rounded-xl border-border bg-background text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground transition-colors"
              />
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Minimum 200 characters required
                </p>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    inputText.length > 190_000
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {inputText.length.toLocaleString()} / 200,000
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60" />

          {/* Step 2 — Summary length */}
          <div>
            <StepLabel number={2} label="Summary length" />
            <div className="flex flex-wrap gap-3">
              {[
                {
                  value: "short" as const,
                  label: "Short",
                  description: "Key points only",
                },
                {
                  value: "medium" as const,
                  label: "Medium",
                  description: "Balanced detail",
                },
                {
                  value: "long" as const,
                  label: "Long",
                  description: "Comprehensive",
                },
              ].map((opt) => (
                <LengthPill
                  key={opt.value}
                  {...opt}
                  selected={summaryLength === opt.value}
                  onClick={() => setSummaryLength(opt.value)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border/60" />

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleGenerateSummary}
              disabled={!hasContent || isProcessing || isExtractPending}
              size="lg"
              className="rounded-xl px-8 font-semibold gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Summarising…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" /> Summarise
                </>
              )}
            </Button>

            {/* Ask AI button lives here too — contextual */}
            <AIDialog text={inputText} />

            {!hasContent && !isProcessing && (
              <p className="text-sm text-muted-foreground w-full sm:w-auto">
                Add at least 200 characters to continue
              </p>
            )}
          </div>
        </motion.div>

        {/* Summary output */}
        <AnimatePresence>
          {(summary || isProcessing) && (
            <motion.div
              ref={outputRef}
              key="summary"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
                    AI Summary
                  </h3>
                  {summary && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {summaryLength} ·{" "}
                      {summary.split(" ").length.toLocaleString()} words
                    </p>
                  )}
                </div>
                {summary && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSummary("")}
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                    <CopyExport content={summary} filename="summary" />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                {isProcessing && !summary ? (
                  <div className="p-10 space-y-4 animate-pulse">
                    <div className="h-5 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-10/12" />
                    <div className="h-4 bg-muted rounded w-4/5" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full">
                    <div className="mx-auto max-w-3xl px-4 sm:px-10 py-6 sm:py-10 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90">
                      <AIContentDisplay content={summary} />
                    </div>
                  </ScrollArea>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Practice questions & flashcards */}
        {hasContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <PracticeQuestions content={inputText} />
            <FlashcardCarousel content={inputText} />
          </motion.div>
        )}

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="border-t border-border/60 pt-16"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            How it works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Upload your material",
                body: "Drop a PDF, DOCX, or TXT file - or paste your notes directly into the text box.",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "Let AI process it",
                body: "Choose summary length, then generate a summary, quiz questions, or flashcards in seconds.",
              },
              {
                icon: Brain,
                step: "03",
                title: "Study & retain more",
                body: "Quiz yourself, flip through flashcards, or ask the AI follow-up questions about your content.",
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground/60 tracking-widest">
                    {step}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}