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
import { Separator } from "@/components/ui/separator";
import { SummaryCardSkeleton } from "./summary-card-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { FullUserSummary } from "@/models/user-summary";
import { FullTermPaper } from "@/models/term-paper";
import Link from "next/link";
import { FullUserFlashcard } from "@/models/user-flashcards-schema";
import {FlashcardSetCard} from "@/components/flashcard-set-card";
import {QuizSetCard} from "@/components/quiz-set-card";
import {FullUserQuestion} from "@/models/user-questions-schema";

interface PaginatedSummaryResponse {
  data: FullUserSummary[];
  currentPage: number;
  totalPages: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
}
interface PaginatedContentResponse {
  data: FullTermPaper[];
  currentPage: number;
  totalPages: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
}
interface PaginatedFlashcardResponse {
  data: FullUserFlashcard[];
  currentPage: number;
  totalPages: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
}
interface PaginatedQuizResponse {
  data: FullUserQuestion[];
  currentPage: number;
  totalPages: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
}

interface StatsErrorProps {
  onRetry: () => void;
  error?: Error | null;
}

type SummaryQueryKey = ["stats-summary"];
type ContentQueryKey = ["stats-content"];
type FlashcardQueryKey = ["stats-flashcard"];
type QuizQueryKey = ["stats-quiz"];
const fetchSummary = async ({
  signal,
}: QueryFunctionContext<SummaryQueryKey>): Promise<PaginatedSummaryResponse> => {
  const response = await fetch("/api/dashboard/stats/summary?limit=3", {
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to fetch user summaries");
  }
  return response.json();
};
const fetchContent = async ({
  signal,
}: QueryFunctionContext<ContentQueryKey>): Promise<PaginatedContentResponse> => {
  const response = await fetch("/api/dashboard/stats/content?limit=3", {
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to fetch contents generated");
  }
  return response.json();
};
const fetchFlashcard = async ({
  signal,
}: QueryFunctionContext<FlashcardQueryKey>): Promise<PaginatedFlashcardResponse> => {
  const response = await fetch("/api/dashboard/stats/flashcards?limit=3", {
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to fetch flashcards generated");
  }
  return response.json();
};
const fetchQuiz = async ({
  signal,
}: QueryFunctionContext<QuizQueryKey>): Promise<PaginatedQuizResponse> => {
  const response = await fetch("/api/dashboard/stats/quiz?limit=3", {
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to fetch quiz generated");
  }
  return response.json();
};



interface StatsErrorProps {
  onRetry: () => void;
  error?: Error | null;
}
function StatsError({ onRetry, error }: StatsErrorProps) {
  return (
    <Card className="md:col-span-3">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || " Failed to load user summaries"}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
    // </div>
  );
}

export const DashboardUI: FC = () => {
    const [viewingContent, setViewingContent] = useState<{
      type: "term-paper" | "summary" | "flashcards" | "quiz" | null;
      data: FullUserSummary | FullTermPaper | FullUserQuestion | FullUserFlashcard | null;
    }>({ type: null, data: null });
  const {
    data: summaryData,
    error: summaryError,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = fetchData<PaginatedSummaryResponse, SummaryQueryKey>(
    ["stats-summary"],
    fetchSummary
  );
  const {
    data: contentData,
    error: contentError,
    isLoading: contentLoading,
    refetch: refetchContent,
  } = fetchData<PaginatedContentResponse, ContentQueryKey>(
    ["stats-content"],
    fetchContent
  );
  const {
    data: flashcardData,
    error: flashcardError,
    isLoading: flashcardLoading,
    refetch: refetchFlashcard,
  } = fetchData<PaginatedFlashcardResponse, FlashcardQueryKey>(
    ["stats-flashcard"],
    fetchFlashcard
  );
  const {
    data: quizData,
    error: quizError,
    isLoading: quizLoading,
    refetch: refetchQuiz,
  } = fetchData<PaginatedQuizResponse, QuizQueryKey>(
    ["stats-quiz"],
    fetchQuiz
  );

  const summaries = summaryData?.data;
  const contents = contentData?.data;
  const flashcards = flashcardData?.data;
  const quizzes = quizData?.data;
  const handleEditedContent = (content: string) => {
    setViewingContent((prev) => {
      if (prev.type === "term-paper" && prev.data) {
        return { type: "term-paper", data: { ...prev.data, content } };
      }
      return prev;
    });
  }
  return (
    <div className="">
      {/* <FilterControls /> */}

      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Term Papers & Essays
            </h2>
            <Button asChild variant="outline">
              <Link href="/dashboard/content">View All</Link>
            </Button>
            {/* <Button variant="outline" asChild> <Link href="/dashboard/content">View All</Link></Button> */}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SummaryCardSkeleton key={i} />
                ))}
              </>
            )}
            {!contentLoading && (contentError || !contents) && (
              <StatsError
                onRetry={() => refetchContent()}
                error={contentError}
              />
            )}
            {!contentLoading && !contentError && contents && (
              <>
                {contents.length > 0 ? (
                  <>
                    {contents.map((paper) => (
                      <TermPaperCard
                        key={paper._id.toString()}
                        paper={paper}
                        onView={(paper: FullTermPaper) =>
                          setViewingContent({ type: "term-paper", data: paper })
                        }
                      />
                    ))}
                  </>
                ) : (
                  <p className="text-center w-full col-span-3 py-8 ">
                    Looks like you don’t have any term papers, essays or letters
                    yet. Create one now to get started!
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <Separator />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Summaries</h2>
            {/* <Button variant="outline" asChild>
              {" "}
              <Link href="/dashboard/summary"> View All</Link>
            </Button> */}
            <Button asChild variant="outline">
              <Link href="/dashboard/summary">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SummaryCardSkeleton key={i} />
                ))}
              </>
            )}
            {!summaryLoading && (summaryError || !summaries) && (
              <StatsError
                onRetry={() => refetchSummary()}
                error={summaryError}
              />
            )}

            {!summaryLoading && !summaryError && summaries && (
              <>
                {summaries.length > 0 ? (
                  <>
                    {summaries.map((summary) => (
                      <SummaryCard
                        key={summary._id.toString()}
                        summary={summary}
                        onView={(summary: FullUserSummary) =>
                          setViewingContent({ type: "summary", data: summary })
                        }
                      />
                    ))}
                  </>
                ) : (
                  <p className="text-center w-full col-span-3 py-8 ">
                    Looks like you don’t have any summaries yet. Create one now
                    to get started!
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <Separator />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Flashcard Sets
            </h2>
              <Button asChild variant="outline">
              <Link href="/dashboard/flashcards">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcardLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SummaryCardSkeleton key={i} />
                ))}
              </>
            )}
            {!flashcardLoading && (flashcardError || !flashcards) && (
              <StatsError
                onRetry={() => refetchFlashcard()}
                error={flashcardError}
              />
            )}

            {!flashcardLoading && !flashcardError && flashcards && (
              <>
                {flashcards.length > 0 ? (
                  <>
                    {flashcards.map((flashcardSet) => (
                      <FlashcardSetCard
                        key={flashcardSet._id.toString()}
                        flashcardSet={flashcardSet}
                        onView={(set: FullUserFlashcard) =>
                          setViewingContent({ type: "flashcards", data: set })
                        }
                      />
                    ))}
                  </>
                ) : (
                  <p className="text-center w-full col-span-3 py-8 ">
                    Looks like you don’t have any flashcards yet. Create one now
                    to get started!
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        
              <Separator />

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Quiz Sets</h2>
                  <Button asChild variant="outline">
              <Link href="/dashboard/quiz">View All</Link>
            </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {quizLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SummaryCardSkeleton key={i} />
                ))}
              </>
            )}
            {!quizLoading && (quizError || !quizzes) && (
              <StatsError
                onRetry={() => refetchQuiz()}
                error={quizError}
              />
            )}

            {!quizLoading && !quizError && quizzes && (
              <>
                {quizzes.length > 0 ? (
                  <>
                    {quizzes.map((quizSet) => (
                    <QuizSetCard
                      key={quizSet._id.toString()}
                      quizSet={quizSet}
                      onView={(set) => setViewingContent({ type: "quiz", data: set })}
                    />
                  ))}
                  </>
                ) : (
                  <p className="text-center w-full col-span-3 py-8 ">
                    Looks like you don’t have any quizzes yet. Create one now
                    to get started!
                  </p>
                )}
              </>
            )}
                 
                </div>
              </section>
      </div>
      {viewingContent.type === "term-paper" && viewingContent.data && (
        <TermPaperViewer
          paper={viewingContent.data as FullTermPaper}
          onClose={() => setViewingContent({ type: null, data: null })}
          handleEditedContent={handleEditedContent}
        />
      )}
      {viewingContent.type === "summary" && viewingContent.data && (
        <SummaryViewer
          summary={viewingContent.data as FullUserSummary}
          onClose={() => setViewingContent({ type: null, data: null })}
        />
      )}
      {viewingContent.type === "flashcards" && viewingContent.data && (
        <FlashcardViewer
          flashcardSet={viewingContent.data as FullUserFlashcard}
          onClose={() => setViewingContent({ type: null, data: null })}
        />
      )}
       {viewingContent.type === "quiz" && (
          <QuizViewer quizSet={viewingContent.data as FullUserQuestion} onClose={() => setViewingContent({ type: null, data: null })} />
        )}
    </div>
  );
};
