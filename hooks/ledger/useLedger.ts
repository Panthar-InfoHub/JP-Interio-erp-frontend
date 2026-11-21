"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ledgerApi } from "@/lib/api/ledger.api";
import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type { AdjustmentInput } from "@/types/ledger";

type Query = Record<string, string | number>;

export function useLedgerList(query: Query) {
  return useQuery({
    queryKey: queryKeys.ledger.list(query),
    queryFn: () => ledgerApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function usePartnerWallet(id: string) {
  return useQuery({
    queryKey: queryKeys.ledger.partnerWallet(id),
    queryFn: () => ledgerApi.partnerWallet(id),
  });
}

export function usePartnerLedger(id: string, query: Query, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ledger.partnerLines(id, query),
    queryFn: () => ledgerApi.partnerLedger(id, query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function usePartnerScans(id: string, query: Query, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ledger.partnerScans(id, query),
    queryFn: () => ledgerApi.partnerScans(id, query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** `asOf` null = now. */
export function useLiability(asOf: string | null) {
  return useQuery({
    queryKey: queryKeys.ledger.liability(asOf),
    queryFn: () => ledgerApi.liability(asOf ?? undefined),
  });
}

/**
 * Staff who make ledger lines (Admins, Sub-Admins, Zonal Heads), for the "Made by"
 * filter. Needs `users.view` (Admin, Zonal Head, DEC-256); a Zonal Head gets only what
 * the server lets them see.
 */
export function useLineMakerOptions(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.lineMakerOptions,
    queryFn: async () => {
      const pages = await Promise.all(
        (["admin", "sub_admin", "zonal_head"] as const).map((role) => usersApi.listByRole(role)),
      );
      return pages.flatMap((page) => page.items);
    },
    staleTime: 5 * 60_000,
    enabled,
  });
}

/**
 * Add or take away points (DEC-256). Afterwards every ledger view, the liability, the
 * partner's Partner 360 and the dashboard are refreshed.
 */
export function useAdjustPoints(partnerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdjustmentInput) => ledgerApi.adjust(partnerId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(partnerId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });
}
