"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { payoutsApi } from "@/lib/api/payouts.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type { MarkPaidInput, PaidDetailsChanges } from "@/types/payout";

export function usePayoutList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.payouts.list(query),
    queryFn: () => payoutsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function usePayout(id: string) {
  return useQuery({ queryKey: queryKeys.payouts.detail(id), queryFn: () => payoutsApi.get(id) });
}

/**
 * The payout steps (DEC-254). Afterwards every payout list and detail, the partner's
 * Partner 360 (wallet + payouts box) and the dashboard numbers are refreshed.
 */
export function usePayoutActions(id: string, partnerId: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all }),
      // Steps move points (hold / release / redeem / refund lines, liability).
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(partnerId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
  };

  return {
    refresh,
    approve: useMutation({ mutationFn: () => payoutsApi.approve(id), onSuccess: refresh }),
    decline: useMutation({
      mutationFn: (reason: string) => payoutsApi.decline(id, reason),
      onSuccess: refresh,
    }),
    markPaid: useMutation({
      mutationFn: (input: MarkPaidInput) => payoutsApi.markPaid(id, input),
      onSuccess: refresh,
    }),
    editPaidDetails: useMutation({
      mutationFn: (changes: PaidDetailsChanges) => payoutsApi.editPaidDetails(id, changes),
      onSuccess: refresh,
    }),
    markFailed: useMutation({
      mutationFn: (reason: string) => payoutsApi.markFailed(id, reason),
      onSuccess: refresh,
    }),
  };
}
