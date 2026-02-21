"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  CheckCircle,
  RefreshCw,
  Volume2,
  Wand2,
  BookOpen,
  Users,
  Briefcase,
  Pause,
  StopCircle,
  Play,
  Check,
  X,
  AlignLeft,
  Clock,
  Hash,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { rephraseText } from "@/actions/rephrase-text";
import createToast from "@/hooks/create-toast";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { fixGrammar } from "@/actions/fix-grammar";
import { CopyExport } from "./copy-exports";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "formal" | "friendly" | "academic" | "casual";

// ─── Tone pill ────────────────────────────────────────────────────────────────

const toneOptions: { value: Tone; label: string; icon: React.ElementType }[] = [
  { value: "formal", label: "Formal", icon: Briefcase },
  { value: "friendly", label: "Friendly", icon: Users },
  { value: "academic", label: "Academic", icon: BookOpen },
  { value: "casual", label: "Casual", icon: Users },
];

interface TonePillProps {
  value: Tone;
  label: string;
  icon: React.ElementType;
  selected: boolean;
  onClick: () => void;
}

function TonePill({ label, icon: Icon, selected, onClick }: TonePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40 hover:bg-accent",
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

// ─── Stat row ────────────────────────────────────────────────────────────────

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WritingCompanionClient() {
  const [text, setText] = useState("");
  const [selectedTone, setSelectedTone] = useState<Tone>("formal");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const { createError, createSimple } = createToast();

  // ── Derived stats ──────────────────────────────────────────────────────────

  const words =
    text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFixGrammar = async () => {
    if (text.trim().length < 50)
      return createError("Please enter at least 50 characters.");
    if (text.length > 50_000)
      return createError("Text must have at most 50,000 characters.");
    try {
      setIsProcessing(true);
      setSuggestions([]);
      const { grammarFixes, error } = await fixGrammar(text);
      if (error) return createError(error);
      if (grammarFixes.length < 1)
        return createSimple("Looks good! No grammar errors detected.");
      setSuggestions(grammarFixes);
      createSimple("Grammar check complete.");
      setTimeout(
        () =>
          suggestionsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        100,
      );
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRephrase = async () => {
    if (text.trim().length < 100)
      return createError("Please enter at least 100 characters.");
    if (text.length > 50_000)
      return createError("Text must have at most 50,000 characters.");
    try {
      setIsRephrasing(true);
      setPreviousText(text);
      const { error, rephrase } = await rephraseText(text, selectedTone);
      if (error || !rephrase)
        return createError(error || ERROR_MESSAGES.UNKNOWN_ERROR);
      setText(rephrase);
      setShowConfirmButtons(true);
    } catch {
      createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleAccept = () => {
    setPreviousText("");
    setShowConfirmButtons(false);
  };
  const handleReject = () => {
    setText(previousText);
    setPreviousText("");
    setShowConfirmButtons(false);
  };

  const handlePlay = () => {
    if (!("speechSynthesis" in window)) return;
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    if (isSpeaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const isBusy = isProcessing || isRephrasing;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="  ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <PenTool className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">
              Writing Companion
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Grammar · Rephrase · Listen
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <h2 className="text-4xl font-bold tracking-tight">
            Write better, instantly.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            Fix grammar, rephrase for any tone, and listen back to your writing
            - all in one place.
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Editor panel (2/3) ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 py-3 border-b border-border/60">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Editor
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CopyExport content={text} filename="writing-companion" />
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                placeholder="Start writing here… paste existing text or write from scratch. AI will help you improve it."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[380px] sm:min-h-[460px] resize-none rounded-none border-0 border-b border-border/60 bg-background px-4 sm:px-6 py-5 text-sm leading-7 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* Action bar */}
              <div className="px-4 sm:px-6 py-4 space-y-4">
                {/* Rephrase accept/reject banner */}
                <AnimatePresence>
                  {showConfirmButtons && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-accent/40 px-4 py-3"
                    >
                      <span className="text-xs font-medium flex-1 text-muted-foreground">
                        Text rephrased — keep this version?
                      </span>
                      <Button
                        onClick={handleAccept}
                        size="sm"
                        className="rounded-lg gap-1.5 h-7 px-3 text-xs"
                      >
                        <Check className="h-3 w-3" /> Keep
                      </Button>
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 h-7 px-3 text-xs"
                      >
                        <X className="h-3 w-3" /> Undo
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Fix Grammar */}
                  <Button
                    onClick={handleFixGrammar}
                    disabled={!text.trim() || isBusy}
                    size="sm"
                    className="rounded-xl gap-1.5"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {isProcessing ? "Checking…" : "Check Grammar"}
                  </Button>

                  {/* Tone pills + Rephrase */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {toneOptions.map((t) => (
                      <TonePill
                        key={t.value}
                        {...t}
                        selected={selectedTone === t.value}
                        onClick={() => setSelectedTone(t.value)}
                      />
                    ))}
                  </div>

                  {!showConfirmButtons && (
                    <Button
                      onClick={handleRephrase}
                      disabled={!text.trim() || isBusy}
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {isRephrasing ? "Rephrasing…" : "Rephrase"}
                    </Button>
                  )}

                  {/* TTS controls */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {!isSpeaking ? (
                      <Button
                        onClick={handlePlay}
                        disabled={!text.trim()}
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Listen
                      </Button>
                    ) : (
                      <>
                        {isPaused ? (
                          <Button
                            onClick={handlePlay}
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5" /> Resume
                          </Button>
                        ) : (
                          <Button
                            onClick={handlePause}
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-1.5"
                          >
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </Button>
                        )}
                        <Button
                          onClick={handleStop}
                          variant="destructive"
                          size="sm"
                          className="rounded-xl gap-1.5"
                        >
                          <StopCircle className="h-3.5 w-3.5" /> Stop
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Sidebar (1/3) ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="space-y-4"
          >
            {/* Stats card */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border/60">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Stats
                </span>
              </div>
              <div className="px-5 py-1">
                <StatRow
                  icon={AlignLeft}
                  label="Words"
                  value={words.toLocaleString()}
                />
                <StatRow
                  icon={Hash}
                  label="Characters"
                  value={chars.toLocaleString()}
                />
                <StatRow
                  icon={Clock}
                  label="Reading time"
                  value={`${readingTime} min`}
                />
                <StatRow
                  icon={BookMarked}
                  label="Sentences"
                  value={sentences.toLocaleString()}
                />
              </div>
            </div>

            {/* Suggestions card */}
            <div
              ref={suggestionsRef}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60">
                <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  AI Suggestions
                </span>
                {suggestions.length > 0 && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                    {suggestions.length}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {suggestions.length > 0 ? (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-border/50"
                  >
                    {suggestions.map((suggestion, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-5 py-3 group"
                      >
                        <p className="text-xs leading-relaxed text-foreground/80">
                          {suggestion}
                        </p>
                      </motion.div>
                    ))}
                    <div className="px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuggestions([])}
                        className="w-full rounded-xl text-xs text-muted-foreground h-7"
                      >
                        Clear suggestions
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 px-5 text-center"
                  >
                    <Wand2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Click <span className="font-semibold">Fix Grammar</span>{" "}
                      to get AI-powered suggestions for your text.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="border-t border-border/60 pt-14"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            How it works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                step: "01",
                title: "Fix grammar",
                body: "Paste or write your text, then click Fix Grammar to get a list of errors with corrections.",
              },
              {
                icon: RefreshCw,
                step: "02",
                title: "Rephrase the tone",
                body: "Choose a tone - formal, academic, casual, or friendly - then rephrase your text instantly.",
              },
              {
                icon: Volume2,
                step: "03",
                title: "Listen back",
                body: "Use the built-in text-to-speech to hear your writing read aloud and catch errors by ear.",
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
