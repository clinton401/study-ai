"use client";
import { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, 
        refetchOnWindowFocus: false,
      },
    },
  });
  
  

export const TanstackQueryClient: FC<{ children: ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
