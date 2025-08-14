import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
    UseInfiniteQueryResult,
  } from "@tanstack/react-query";
  
  interface InfiniteScrollResult<TData> {
    data: TData[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    isFetching: boolean;
    refetch: () => void
  }
  
  /**
   * useInfiniteScroll
   * A reusable hook for infinite scrolling using TanStack Query.
   *
   * @template TData - The type of individual items returned in the data array.
   * @template TQueryFnData - The type of the data returned by the query function.
   * @param {(params: { pageParam?: number }) => Promise<TQueryFnData>} fetchFn - Function to fetch data. Should accept a `pageParam`.
   * @param {string[]} queryKey - Unique key for caching and identifying the query.
   * @param {UseInfiniteQueryOptions<TQueryFnData, Error, TQueryFnData>} [options] - Additional options for React Query's `useInfiniteQuery`.
   * @returns {InfiniteScrollResult<TData>} - Returns data, loading states, error, and a function to fetch more data.
   */
  const useInfiniteScroll = <TData, TQueryFnData extends { nextPage?: number }>(
    fetchFn: ({
      pageParam,
      signal,
    }: {
      pageParam?: number;
      signal: AbortSignal;
    }) => Promise<TQueryFnData>,
    queryKey: string[],
    options?: Partial<UseInfiniteQueryOptions<TQueryFnData, Error, TQueryFnData>>
  ): InfiniteScrollResult<TData> => {
    const {
      data,
      isLoading,
      isError,
      error,
      isFetching,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      refetch
    }: UseInfiniteQueryResult<TQueryFnData, Error> = useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam = 1, signal }) => {
        return fetchFn({
          pageParam: pageParam as number, // Explicitly cast pageParam to number
          signal,
        });
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage?.nextPage ?? null,
            ...options,
    });
  const newData = data as  {
    pages: any
  } | undefined;
    // Flatten the data across pages
    const flatData: TData[] = newData?.pages.flatMap((page: any) => page.data) || [];

  
    return {
      data: flatData,
      isLoading,
      isError,
      error: error || null, // Ensure `error` is explicitly null if undefined
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      refetch,
      isFetching
    };
  };
  
  export default useInfiniteScroll;
  