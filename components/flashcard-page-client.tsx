"use client";

import { GeneralPageUI } from "@/components/general-page-ui";
import { FullUserFlashcard } from "@/models/user-flashcards-schema";
import { FlashcardSetCard } from "@/components/flashcard-set-card";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { SummaryCardSkeleton } from "@/components/summary-card-skeleton";

export function FlashcardPageClient() {
  const renderCard = (set: FullUserFlashcard, onView: (f: FullUserFlashcard) => void) => (
    <FlashcardSetCard flashcardSet={set} onView={() => onView(set)} />
  );

  const renderViewer = (set: FullUserFlashcard, onClose: () => void) => (
    <FlashcardViewer flashcardSet={set} onClose={onClose} />
  );

  const fetchItems = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }) => {
    const res = await fetch(`/api/dashboard/stats/flashcards?page=${pageParam}`, { signal });
    if (!res.ok) throw new Error("Failed to fetch flashcards");
    const data = await res.json();
    return { data: data.data as FullUserFlashcard[], nextPage: data.nextPage };
  };

  return (
    <GeneralPageUI<FullUserFlashcard>
      title="Flashcards"
      fetchItems={fetchItems}
      skeleton={<SummaryCardSkeleton />}
      renderCard={renderCard}
      renderViewer={renderViewer}
      emptyText="No flashcard sets yet. Generate one from the Study Tools."
    />
  );
}