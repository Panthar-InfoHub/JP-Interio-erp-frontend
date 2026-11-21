import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/api/errors";

/**
 * Shared TanStack Query settings for the console.
 * - Data counts as fresh for 30 s, so moving between pages doesn't refetch at once.
 * - No refetch just because the window got focus (staff switch tabs a lot).
 * - Retry once on network / server trouble; never retry 4xx (wrong input, no access,
 *   not found): retrying would only repeat the same answer.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
