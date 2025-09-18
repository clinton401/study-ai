"use client";

import { GeneralPageUI } from "@/components/general-page-ui";
import { FullUserQuestion } from "@/models/user-questions-schema";
import {QuizSetCard} from "@/components/quiz-set-card";
import { QuizViewer } from "@/components/quiz-viewer";
import { SummaryCardSkeleton } from "@/components/summary-card-skeleton";

export function QuizPageClient() {
  const renderCard = (quiz: FullUserQuestion, onView: (q: FullUserQuestion) => void) => (
    <QuizSetCard quizSet={quiz} onView={() => onView(quiz)} />
  );

  const renderViewer = (quiz: FullUserQuestion, onClose: () => void) => (
    <QuizViewer quizSet={quiz} onClose={onClose} />
  );

  const fetchItems = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }) => {
    const res = await fetch(`/api/dashboard/stats/quiz?page=${pageParam}`, { signal });
    if (!res.ok) throw new Error("Failed to fetch quizzes");
    const data = await res.json();
    return { data: data.data as FullUserQuestion[], nextPage: data.nextPage };
  };

  return (
    <GeneralPageUI<FullUserQuestion>
      title="Quizzes"
      fetchItems={fetchItems}
      skeleton={<SummaryCardSkeleton />}
      renderCard={renderCard}
      renderViewer={renderViewer}
      emptyText="No quizzes found."
    />
  );
}
