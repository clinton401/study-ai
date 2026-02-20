"use client";

import { useState, useEffect, ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { FilterControls } from "@/components/filter-controls";
import { ErrorComp } from "@/components/error-comp";

type FetchResult<T> = {
  data: T[];
  nextPage?: number;
};

type GeneralPageUIProps<T> = {
  title: string;
  fetchItems: (args: { pageParam?: number; signal?: AbortSignal }) => Promise<FetchResult<T>>;
  renderCard: (item: T, onView: (item: T) => void) => ReactNode;
  skeleton: ReactNode;
  renderViewer: (item: T, onClose: () => void) => ReactNode;
  emptyText?: string;
};

export function GeneralPageUI<T>({
  title,
  fetchItems,
  renderCard,
  skeleton,
  renderViewer,
  emptyText = "No items found.",
}: GeneralPageUIProps<T>) {
  const [viewingItem, setViewingItem] = useState<T | null>(null);
  const { ref, inView } = useInView();

  const {
    data: items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<T, FetchResult<T>>(
    ({ pageParam = 1, signal }) => fetchItems({ pageParam, signal }),
    [title]
  );

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="w-full px-4 sm:px-6 py-8 min-h-full overflow-x-hidden">
      <FilterControls title={title} />

      <div className="grid mt-6 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <div key={i}>{skeleton}</div>)}

        {!isLoading && (error || !items) && (
          <ErrorComp onRetry={refetch} error={error} />
        )}

        {!isLoading && !error && items && (
          items.length > 0
            ? items.map((item, i) => (
                <div key={i}>{renderCard(item, setViewingItem)}</div>
              ))
            : <p className="col-span-full py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {isFetchingNextPage && (
        <div className="w-full flex items-center justify-center py-8">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={ref} className="w-full" />

      {viewingItem && renderViewer(viewingItem, () => setViewingItem(null))}
    </div>
  );
}