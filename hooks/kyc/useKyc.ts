"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { kycApi } from "@/lib/api/kyc.api";
import { queryKeys } from "@/lib/query/queryKeys";

export function useKycQueue(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.kyc.queue(query),
    queryFn: () => kycApi.queue(query),
    placeholderData: keepPreviousData,
  });
}

export function useKycDetail(id: string) {
  return useQuery({ queryKey: queryKeys.kyc.detail(id), queryFn: () => kycApi.get(id) });
}

/**
 * Approve / reject / undo. Afterwards the queue, this partner (KYC and Partner 360) and
 * the partner lists are refreshed; the reply already holds the new state.
 */
export function useKycActions(id: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(id) }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.partners.all, "list"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
  };

  return {
    approve: useMutation({
      mutationFn: (asmId?: string) => kycApi.approve(id, asmId),
      onSuccess: refresh,
    }),
    reject: useMutation({
      mutationFn: (reason: string) => kycApi.reject(id, reason),
      onSuccess: refresh,
    }),
    undoRejection: useMutation({
      mutationFn: (reason: string) => kycApi.undoRejection(id, reason),
      onSuccess: refresh,
    }),
  };
}
