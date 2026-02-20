"use client";

import { FC, useState } from "react";
import fetchData from "@/hooks/fetch-data";
import { QueryFunctionContext } from "@tanstack/react-query";
import { SummaryCard } from "@/components/summary-card";
import { SummaryViewer } from "@/components/summary-viewer";
import { QuizViewer } from "@/components/quiz-viewer";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { TermPaperCard } from "@/components/term-paper-card";
import { TermPaperViewer } from "@/components/term-paper-viewer";
import { Button } from "@/components/ui/button";
import { SummaryCardSkeleton } from "./summary-card-skeleton";
import { RefreshCw, AlertCircle } from "lucide-react";
import { FullUserSummary } from "@/models/user-summary";
import { FullTermPaper } from "@/models/term-paper";
import Link from "next/link";
import { FullUserFlashcard } from "@/models/user-flashcards-schema";
import { FlashcardSetCard } from "@/components/flashcard-set-card";
import { QuizSetCard } from "@/components/quiz-set-card";
import { FullUserQuestion } from "@/models/user-questions-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Paginated<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
}

type SummaryQueryKey   = ["stats-summary"];
type ContentQueryKey   = ["stats-content"];
type FlashcardQueryKey = ["stats-flashcard"];
type QuizQueryKey      = ["stats-quiz"];

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const fetchSummary = async ({ signal }: QueryFunctionContext<SummaryQueryKey>): Promise<Paginated<FullUserSummary>> => {
  const res = await fetch("/api/dashboard/stats/summary?limit=3", { signal });
  if (!res.ok) throw new Error((await res.json())?.error || "Failed to fetch summaries");
  return res.json();
};
const fetchContent = async ({ signal }: QueryFunctionContext<ContentQueryKey>): Promise<Paginated<FullTermPaper>> => {
  const res = await fetch("/api/dashboard/stats/content?limit=3", { signal });
  if (!res.ok) throw new Error((await res.json())?.error || "Failed to fetch content");
  return res.json();
};
const fetchFlashcard = async ({ signal }: QueryFunctionContext<FlashcardQueryKey>): Promise<Paginated<FullUserFlashcard>> => {
  const res = await fetch("/api/dashboard/stats/flashcards?limit=3", { signal });
  if (!res.ok) throw new Error((await res.json())?.error || "Failed to fetch flashcards");
  return res.json();
};
const fetchQuiz = async ({ signal }: QueryFunctionContext<QuizQueryKey>): Promise<Paginated<FullUserQuestion>> => {
  const res = await fetch("/api/dashboard/stats/quiz?limit=3", { signal });
  if (!res.ok) throw new Error((await res.json())?.error || "Failed to fetch quizzes");
  return res.json();
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
        <Link href={href}>View All</Link>
      </Button>
    </div>
  );
}

function SectionError({ onRetry, error }: { onRetry: () => void; error?: Error | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8 col-span-3 flex flex-col items-center gap-3 text-center">
      <AlertCircle className="h-7 w-7 text-destructive" />
      <p className="text-sm text-muted-foreground">
        {error?.message || "Failed to load content"}
      </p>
      <Button onClick={onRetry} variant="outline" size="sm" className="rounded-xl gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="col-span-3 py-12 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const DashboardUI: FC = () => {
  const [viewingContent, setViewingContent] = useState<{
    type: "term-paper" | "summary" | "flashcards" | "quiz" | null;
    data: FullUserSummary | FullTermPaper | FullUserQuestion | FullUserFlashcard | null;
  }>({ type: null, data: null });

  const close = () => setViewingContent({ type: null, data: null });

  const { data: summaryData,   error: summaryError,   isLoading: summaryLoading,   refetch: refetchSummary   } = fetchData<Paginated<FullUserSummary>,   SummaryQueryKey>  (["stats-summary"],   fetchSummary);
  const { data: contentData,   error: contentError,   isLoading: contentLoading,   refetch: refetchContent   } = fetchData<Paginated<FullTermPaper>,     ContentQueryKey>  (["stats-content"],   fetchContent);
  const { data: flashcardData, error: flashcardError, isLoading: flashcardLoading, refetch: refetchFlashcard } = fetchData<Paginated<FullUserFlashcard>, FlashcardQueryKey>(["stats-flashcard"], fetchFlashcard);
  const { data: quizData,      error: quizError,      isLoading: quizLoading,      refetch: refetchQuiz      } = fetchData<Paginated<FullUserQuestion>,  QuizQueryKey>     (["stats-quiz"],      fetchQuiz);

  const handleEditedContent = (content: string) => {
    setViewingContent((prev) =>
      prev.type === "term-paper" && prev.data
        ? { type: "term-paper", data: { ...prev.data, content } }
        : prev
    );
  };

  const grid = "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  const skeletons = Array.from({ length: 3 }, (_, i) => <SummaryCardSkeleton key={i} />);

  return (
    <div className="space-y-10">
      {/* Term Papers */}
      <section>
        <SectionHeader title="Term Papers & Essays" href="/dashboard/content" />
        <div className={grid}>
          {contentLoading && skeletons}
          {!contentLoading && (contentError || !contentData) && (
            <SectionError onRetry={() => refetchContent()} error={contentError} />
          )}
          {!contentLoading && !contentError && contentData && (
            contentData.data.length > 0
              ? contentData.data.map((paper) => (
                  <TermPaperCard
                    key={paper._id.toString()}
                    paper={paper}
                    onView={(p) => setViewingContent({ type: "term-paper", data: p })}
                  />
                ))
              : <EmptyState message="No term papers yet. Create one to get started." />
          )}
        </div>
      </section>

      <div className="h-px bg-border/60" />

      {/* Summaries */}
      <section>
        <SectionHeader title="Summaries" href="/dashboard/summary" />
        <div className={grid}>
          {summaryLoading && skeletons}
          {!summaryLoading && (summaryError || !summaryData) && (
            <SectionError onRetry={() => refetchSummary()} error={summaryError} />
          )}
          {!summaryLoading && !summaryError && summaryData && (
            summaryData.data.length > 0
              ? summaryData.data.map((summary) => (
                  <SummaryCard
                    key={summary._id.toString()}
                    summary={summary}
                    onView={(s) => setViewingContent({ type: "summary", data: s })}
                  />
                ))
              : <EmptyState message="No summaries yet. Create one to get started." />
          )}
        </div>
      </section>

      <div className="h-px bg-border/60" />

      {/* Flashcards */}
      <section>
        <SectionHeader title="Flashcard Sets" href="/dashboard/flashcards" />
        <div className={grid}>
          {flashcardLoading && skeletons}
          {!flashcardLoading && (flashcardError || !flashcardData) && (
            <SectionError onRetry={() => refetchFlashcard()} error={flashcardError} />
          )}
          {!flashcardLoading && !flashcardError && flashcardData && (
            flashcardData.data.length > 0
              ? flashcardData.data.map((set) => (
                  <FlashcardSetCard
                    key={set._id.toString()}
                    flashcardSet={set}
                    onView={(s) => setViewingContent({ type: "flashcards", data: s })}
                  />
                ))
              : <EmptyState message="No flashcard sets yet. Create one to get started." />
          )}
        </div>
      </section>

      <div className="h-px bg-border/60" />

      {/* Quizzes */}
      <section>
        <SectionHeader title="Quiz Sets" href="/dashboard/quiz" />
        <div className={grid}>
          {quizLoading && skeletons}
          {!quizLoading && (quizError || !quizData) && (
            <SectionError onRetry={() => refetchQuiz()} error={quizError} />
          )}
          {!quizLoading && !quizError && quizData && (
            quizData.data.length > 0
              ? quizData.data.map((set) => (
                  <QuizSetCard
                    key={set._id.toString()}
                    quizSet={set}
                    onView={(s) => setViewingContent({ type: "quiz", data: s })}
                  />
                ))
              : <EmptyState message="No quiz sets yet. Create one to get started." />
          )}
        </div>
      </section>

      {/* Viewers */}
      {viewingContent.type === "term-paper" && viewingContent.data && (
        <TermPaperViewer paper={viewingContent.data as FullTermPaper} onClose={close} handleEditedContent={handleEditedContent} />
      )}
      {viewingContent.type === "summary" && viewingContent.data && (
        <SummaryViewer summary={viewingContent.data as FullUserSummary} onClose={close} />
      )}
      {viewingContent.type === "flashcards" && viewingContent.data && (
        <FlashcardViewer flashcardSet={viewingContent.data as FullUserFlashcard} onClose={close} />
      )}
      {viewingContent.type === "quiz" && viewingContent.data && (
        <QuizViewer quizSet={viewingContent.data as FullUserQuestion} onClose={close} />
      )}
    </div>
  );
};