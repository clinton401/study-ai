"use client";

import { FC, useState, useEffect } from "react";
import { FilterControls } from "@/components/filter-controls";
import { FullUserSummary } from "@/models/user-summary";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { ErrorComp } from "@/components/error-comp";
import { SummaryCardSkeleton } from "./summary-card-skeleton";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import { SummaryCard } from "@/components/summary-card";
import { SummaryViewer } from "@/components/summary-viewer";

type FetchSummariesResult = {
  data: FullUserSummary[];
  nextPage?: number;
};

export const SummaryPageUI: FC = () => {
  const [sort, setSort] = useState("createdAt");
  const [viewingContent, setViewingContent] = useState<FullUserSummary | null>(null);

  const { ref, inView } = useInView();

  const fetchSummary = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchSummariesResult> => {
    const response = await fetch(
      `/api/dashboard/stats/summary?page=${pageParam}&sort=${sort}`,
      { signal }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    const data = await response.json();
    return { data: data.data, nextPage: data.nextPage };
  };

  const {
    data: summaries,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<FullUserSummary, FetchSummariesResult>(
    ({ pageParam = 1, signal }) => fetchSummary({ pageParam, signal }),
    ["summaries", sort]
  );

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);

  return (
    <div className="w-full px-4 sm:px-6 py-8 min-h-full overflow-x-hidden">
      <FilterControls title="Summaries" sort={sort} setSort={setSort} />

      <div className="grid mt-6 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <SummaryCardSkeleton key={i} />)}

        {!isLoading && (error || !summaries) && (
          <ErrorComp onRetry={() => refetch()} error={error} />
        )}

        {!isLoading && !error && summaries && (
          summaries.length > 0
            ? summaries.map((summary) => (
                <SummaryCard
                  key={summary._id.toString()}
                  summary={summary}
                  onView={setViewingContent}
                  sort={sort}
                />
              ))
            : (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                No summaries yet. Create one to get started.
              </p>
            )
        )}
      </div>

      {/* Infinite scroll */}
      {isFetchingNextPage && (
        <div className="w-full flex items-center justify-center py-8">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={ref} className="w-full" />

      {viewingContent && (
        <SummaryViewer
          summary={viewingContent}
          onClose={() => setViewingContent(null)}
        />
      )}
    </div>
  );
};