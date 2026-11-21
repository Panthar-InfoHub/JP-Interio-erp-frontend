"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { partnersApi } from "@/lib/api/partners.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type {
  PartnerProfileChanges,
  PayoutAccountChanges,
  PayoutAccountInput,
} from "@/types/partner";

/**
 * Every action on one partner (F4 T2). After a change, refresh only that partner and the
 * partner lists (name, owner or zone may have changed) — nothing else.
 */
export function usePartnerActions(id: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.detail(id) }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.partners.all, "list"] }),
    ]);
  };

  return {
    editProfile: useMutation({
      mutationFn: (changes: PartnerProfileChanges) => partnersApi.editProfile(id, changes),
      onSuccess: refresh,
    }),
    changePhone: useMutation({
      mutationFn: (phone: string) => partnersApi.changePhone(id, phone),
      onSuccess: refresh,
    }),
    transfer: useMutation({
      mutationFn: (asmId: string) => partnersApi.transfer(id, asmId),
      onSuccess: refresh,
    }),
    addAccount: useMutation({
      mutationFn: (input: PayoutAccountInput) => partnersApi.addAccount(id, input),
      onSuccess: refresh,
    }),
    editAccount: useMutation({
      mutationFn: ({ accountId, changes }: { accountId: string; changes: PayoutAccountChanges }) =>
        partnersApi.editAccount(id, accountId, changes),
      onSuccess: refresh,
    }),
    setDefaultAccount: useMutation({
      mutationFn: (accountId: string) => partnersApi.setDefaultAccount(id, accountId),
      onSuccess: refresh,
    }),
    removeAccount: useMutation({
      mutationFn: (accountId: string) => partnersApi.removeAccount(id, accountId),
      onSuccess: refresh,
    }),
  };
}
