"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { partnersApi } from "@/lib/api/partners.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type { LookupInput } from "@/types/partner";

/** Who holds a number (POST, so a mutation; the result stays on the page). */
export function useNumberLookup() {
  return useMutation({ mutationFn: (input: LookupInput) => partnersApi.numberLookup(input) });
}

/** Remove an unfinished sign-up (Admin). Refreshes partners, KYC and the dashboard. */
export function useRemoveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ partnerId, reason }: { partnerId: string; reason: string }) =>
      partnersApi.removeDraft(partnerId, reason),
    onSuccess: async (_reply, { partnerId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.partners.detail(partnerId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}
