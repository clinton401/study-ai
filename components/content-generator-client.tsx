"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  FileText,
  Mail,
  Sparkles,
  Loader2,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  Notebook,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyExport } from "./copy-exports";
import { generateContent } from "@/actions/generate-content";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { AIContentDisplay } from "./ai-content-display";
import { EditContentModal } from "@/components/edit-content-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ContentOptions {
  type: string;
  tone: string;
  length: string;
  topic: string;
}

// ─── Option pill / card sub-components ───────────────────────────────────────

interface OptionCardProps {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-w-0",
        selected
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-border bg-card hover:border-foreground/40 hover:bg-accent",
      )}
    >
      <div className="flex items-center gap-2 min-w-0 w-full">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-sm font-semibold tracking-tight truncate">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs leading-snug break-words w-full",
          selected ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {description}
      </span>
    </button>
  );
}

interface LengthPillProps {
  value: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function LengthPill({
  label,
  description,
  selected,
  onClick,
}: LengthPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[80px]",
        selected
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-border bg-card hover:border-foreground/40 hover:bg-accent",
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={cn(
          "text-xs text-center",
          selected ? "text-background/70" : "text-muted-foreground",
        )}
      >
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

export function ContentGeneratorClient() {
  const [options, setOptions] = useState<ContentOptions>({
    type: "",
    tone: "",
    length: "",
    topic: "",
  });
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [paperId, setPaperId] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement | null>(null);
  const { createError, createSimple } = createToast();

  // ── Data ──────────────────────────────────────────────────────────────────

  const contentTypes = [
    {
      value: "essay",
      label: "Essay",
      icon: FileText,
      description: "Academic or persuasive",
    },
    {
      value: "letter",
      label: "Letter",
      icon: Mail,
      description: "Formal or informal",
    },
    {
      value: "term-paper",
      label: "Term Paper",
      icon: Notebook,
      description: "Full academic research paper",
    },
  ];

  const toneOptions = [
    {
      value: "formal",
      label: "Formal",
      icon: Briefcase,
      description: "Professional & structured",
    },
    {
      value: "academic",
      label: "Academic",
      icon: GraduationCap,
      description: "Scholarly & research-focused",
    },
    {
      value: "casual",
      label: "Casual",
      icon: Users,
      description: "Relaxed & conversational",
    },
    {
      value: "friendly",
      label: "Friendly",
      icon: Users,
      description: "Warm & approachable",
    },
  ];

  const getLengthOptions = (type: string) => {
    const isTermPaper = type.toLowerCase() === "term-paper";
    if (isTermPaper) {
      return [
        { value: "short", label: "Short", description: "1–5 pages" },
        { value: "medium", label: "Medium", description: "6–10 pages" },
        { value: "long", label: "Long", description: "11–15 pages" },
      ];
    }
    return [
      { value: "short", label: "Short", description: "500–750 words" },
      { value: "medium", label: "Medium", description: "750–1,200 words" },
      { value: "long", label: "Long", description: "1,200–2,000 words" },
    ];
  };

  const lengthOptions = getLengthOptions(options.type);

  const topicPlaceholder =
    options.type === "essay"
      ? "e.g., The impact of social media on teenage mental health"
      : options.type === "letter"
        ? "e.g., A formal complaint about delayed shipping to customer service"
        : options.type === "term-paper"
          ? "e.g., The role of monetary policy in managing inflation in emerging economies"
          : "Describe what you want to write about — be as specific as possible";

  const isFormValid =
    options.type && options.tone && options.length && options.topic.trim();

  // ── Handler ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!isFormValid) return;
    try {
      setIsGenerating(true);
      setGeneratedContent("");
      setPaperId(null);

      const { topic, tone, length, type } = options;
      if (type === "term-paper") {
        createSimple("Generating your term paper - this may take a moment.");
      }

      const { content, error, id } = await generateContent(
        topic,
        type,
        tone,
        length,
      );

      if (error || !content)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);

      setGeneratedContent(content);
      setWordCount(content.split(" ").length);
      if (id) setPaperId(id);

      setTimeout(
        () =>
          outputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      );
    } catch (err) {
      console.error(`Unable to generate content: ${err}`);
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <PenTool className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">
              AI Content Generator
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Essays · Letters · Term Papers
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-0 sm:px-6 py-12 space-y-16 w-full">
        {/* ── Brief panel ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10 px-4 sm:px-0 overflow-hidden"
        >
          {/* Hero text */}
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">
              What would you like to write?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Tell us the type, tone, and length - then describe your topic.
              We&apos;ll handle the rest.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-8 space-y-10 overflow-hidden">
            {/* Step 1 — Type */}
            <div className="w-full">
              <StepLabel number={1} label="Content Type" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {contentTypes.map((t) => (
                  <OptionCard
                    key={t.value}
                    {...t}
                    selected={options.type === t.value}
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        type: t.value,
                        length: "",
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/60" />

            {/* Step 2 — Tone */}
            <div className="w-full">
              <StepLabel number={2} label="Tone & Style" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {toneOptions.map((t) => (
                  <OptionCard
                    key={t.value}
                    {...t}
                    selected={options.tone === t.value}
                    onClick={() =>
                      setOptions((prev) => ({ ...prev, tone: t.value }))
                    }
                  />
                ))}
              </div>
            </div>

            
            <div className="border-t border-border/60" />

            <div className="w-full">
              <StepLabel number={3} label="Length" />
              <div className="flex flex-wrap gap-3">
                {lengthOptions.map((l) => (
                  <LengthPill
                    key={l.value}
                    {...l}
                    selected={options.length === l.value}
                    onClick={() =>
                      setOptions((prev) => ({ ...prev, length: l.value }))
                    }
                  />
                ))}
                {!options.type && (
                  <p className="self-center text-sm text-muted-foreground pl-1">
                    Select a content type first
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/60" />

            {/* Step 4 — Topic */}
            <div className="w-full">
              <StepLabel number={4} label="Your Topic" />
              <div className="space-y-2">
                <Textarea
                  placeholder={topicPlaceholder}
                  value={options.topic}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  rows={4}
                  className="resize-none rounded-xl border-border bg-background text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground transition-colors w-full"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Be specific — the more detail you give, the better the output.
                  </p>
                  <span
                    className={cn(
                      "text-xs tabular-nums self-end",
                      options.topic.length > 2800
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {options.topic.length} / 3,000
                  </span>
                </div>
              </div>
            </div>

            {/* Generate CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || isGenerating}
                size="lg"
                className="rounded-xl px-8 font-semibold gap-2 transition-all w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {!isFormValid && !isGenerating && (
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Complete all steps above to continue
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── Output panel ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(generatedContent || isGenerating) && (
            <motion.section
              ref={outputRef}
              key="output"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45 }}
              className="space-y-4 px-4 sm:px-0"
            >
              {/* Output header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Generated Content
                  </h3>
                  {generatedContent && (
                    <p className="text-xs text-muted-foreground">
                      {wordCount.toLocaleString()} words ·{" "}
                      <span className="capitalize">{options.type}</span> ·{" "}
                      <span className="capitalize">{options.tone}</span> ·{" "}
                      <span className="capitalize">{options.length}</span>
                    </p>
                  )}
                </div>

                {generatedContent && (
                  <div className="flex gap-2">
                    <EditContentModal
                      content={generatedContent}
                      setContent={setGeneratedContent}
                      id={paperId}
                    />
                    <CopyExport
                      content={generatedContent}
                      filename="generated-content"
                    />
                  </div>
                )}
              </div>

              {/* Document surface */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden w-full">
                {isGenerating && !generatedContent ? (
                  /* Skeleton shimmer while waiting */
                  <div className="p-6 sm:p-10 space-y-4 animate-pulse">
                    <div className="h-6 bg-muted rounded w-2/5" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-11/12" />
                    <div className="h-4 bg-muted rounded w-4/5" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    {/* Mimic a document page inside the card */}
                    <div className="mx-auto max-w-3xl px-4 sm:px-10 py-6 sm:py-10 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/90 break-words overflow-x-hidden">
                      <AIContentDisplay content={generatedContent} />
                    </div>
                  </ScrollArea>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="border-t border-border/60 pt-16 px-4 sm:px-0"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8 text-center sm:text-left">
            How it works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Choose a type",
                body: "Essay, letter, or full term paper - pick the format that fits.",
              },
              {
                icon: Users,
                step: "02",
                title: "Set the tone",
                body: "From formal to friendly, match the voice to your audience.",
              },
              {
                icon: BookOpen,
                step: "03",
                title: "Pick a length",
                body: "Short, medium, or long - we calibrate depth accordingly.",
              },
              {
                icon: Sparkles,
                step: "04",
                title: "Generate",
                body: "Describe your topic and get a complete, ready-to-use draft.",
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
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words">
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
