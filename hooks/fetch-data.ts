import { useQuery, UseQueryOptions, QueryFunction, QueryKey } from "@tanstack/react-query";

const fetchData = <TData, TQueryKey extends QueryKey = QueryKey, TError = Error | null>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TData, TQueryKey>,
  options: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "queryKey" | "queryFn"> = {}
) => {
  return useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 2000,
    ...options,
  });
};

export default fetchData;
