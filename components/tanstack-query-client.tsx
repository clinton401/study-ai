"use client";

import { FC, ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const TanstackQueryClient: FC<{ children: ReactNode }> = ({
  children,
}) => {
  // ✅ FIX: Use state to initialize the client ONCE per app lifecycle
  // This prevents data sharing between users during server-side rendering
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 1 minute
            staleTime: 1000 * 60,
            // Don't refetch just because I clicked another tab and came back
            refetchOnWindowFocus: false,
            // If API fails, try 1 more time before showing error
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );
};
