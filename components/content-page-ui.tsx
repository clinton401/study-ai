"use client";

import { FC, useState, useEffect } from "react";
import { FilterControls } from "@/components/filter-controls";
import { FullTermPaper } from "@/models/term-paper";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { ErrorComp } from "@/components/error-comp";
import { SummaryCardSkeleton } from "./summary-card-skeleton";
import { TermPaperCard } from "@/components/term-paper-card";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import { TermPaperViewer } from "@/components/term-paper-viewer";

type FetchContentsResult = {
  data: FullTermPaper[];
  nextPage?: number;
};

export const ContentPageUI: FC = () => {
  const [sort, setSort] = useState("createdAt");
  const [type, setType] = useState("all");
  const [viewingContent, setViewingContent] = useState<FullTermPaper | null>(null);

  const { ref, inView } = useInView();

  const fetchContents = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchContentsResult> => {
    const response = await fetch(
      `/api/dashboard/stats/content?page=${pageParam}&sort=${sort}&type=${type}`,
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
    data: contents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<FullTermPaper, FetchContentsResult>(
    ({ pageParam = 1, signal }) => fetchContents({ pageParam, signal }),
    ["contents", sort, type]
  );

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);

  const handleEditedContent = (content: string) => {
    setViewingContent((prev) => (prev ? { ...prev, content } : prev));
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 min-h-full overflow-x-hidden">
      <FilterControls
        title="Term Papers & Essays"
        sort={sort}
        setSort={setSort}
        type={type}
        setType={setType}
      />

      <div className="grid mt-6 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <SummaryCardSkeleton key={i} />)}

        {!isLoading && (error || !contents) && (
          <ErrorComp onRetry={() => refetch()} error={error} />
        )}

        {!isLoading && !error && contents && (
          contents.length > 0
            ? contents.map((paper) => (
                <TermPaperCard
                  key={paper._id.toString()}
                  paper={paper}
                  onView={setViewingContent}
                  sort={sort}
                  type={type}
                />
              ))
            : (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                No term papers, essays, or letters yet. Create one to get started.
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
        <TermPaperViewer
          paper={viewingContent}
          sort={sort}
          type={type}
          handleEditedContent={handleEditedContent}
          onClose={() => setViewingContent(null)}
        />
      )}
    </div>
  );
};