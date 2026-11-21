"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/lib/api/auth.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** My logged-in devices, most recently used first. */
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: authApi.listSessions,
  });
}

/** Log out one other device; the list refreshes afterwards. */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions }),
  });
}
