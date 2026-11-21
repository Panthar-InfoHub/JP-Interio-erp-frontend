"use client";

import { useQuery } from "@tanstack/react-query";

import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query/queryKeys";

/**
 * Active ASMs for a filter or picker, A → Z. Needs `users.view`: pass `enabled: false`
 * for roles without it (e.g. the Partners & KYC Sub-Admin, DEC-240).
 */
export function useAsmOptions(zoneId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.asmOptions(zoneId),
    queryFn: async () => (await usersApi.listAsms(zoneId)).items,
    staleTime: 5 * 60_000,
    enabled,
  });
}
