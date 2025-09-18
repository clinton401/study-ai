"use client";
import {  useState, useEffect, ReactNode } from "react";
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
//   const [sort, setSort] = useState("createdAt");
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
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="w-full px-4 py-6 h-full">
      <FilterControls title={title}  />

      <div className="grid pt-6 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <div key={i}>{skeleton}</div>)}

        {!isLoading && (error || !items) && (
          <ErrorComp onRetry={refetch} error={error} />
        )}

        {!isLoading && !error && items && (
          items.length > 0 ? (
            items.map((item, i) => (
              <div key={i}>{renderCard(item, setViewingItem)}</div>
            ))
          ) : (
            <p className="text-center w-full col-span-3 py-8">{emptyText}</p>
          )
        )}
      </div>

      {isFetchingNextPage && (
        <section className="w-full flex items-center justify-center py-8">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}

      <section ref={ref} className="w-full" />

      {viewingItem && renderViewer(viewingItem, () => setViewingItem(null))}
    </div>
  );
}
