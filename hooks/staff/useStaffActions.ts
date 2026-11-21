"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type { StaffChanges, StaffCreateInput } from "@/types/staff";

/**
 * Every staff change (F6 T3). Afterwards refresh the staff data, the zones (head counts,
 * Zonal Head) and the partners (switching off a Sales Executive hands their partners back
 * to the ASM; moving one leaves them with the old ASM).
 */
function useRefreshStaff() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.all }),
    ]);
  };
}

export function useCreateStaff() {
  const refresh = useRefreshStaff();
  return useMutation({
    mutationFn: (input: StaffCreateInput) => usersApi.create(input),
    onSuccess: refresh,
  });
}

/** The actions on one staff member. */
export function useStaffActions(id: string) {
  const refresh = useRefreshStaff();
  return {
    update: useMutation({
      mutationFn: (changes: StaffChanges) => usersApi.update(id, changes),
      onSuccess: refresh,
    }),
    deactivate: useMutation({ mutationFn: () => usersApi.deactivate(id), onSuccess: refresh }),
    reactivate: useMutation({ mutationFn: () => usersApi.reactivate(id), onSuccess: refresh }),
    transfer: useMutation({
      mutationFn: (target: { asmId: string } | { zoneId: string }) => usersApi.transfer(id, target),
      onSuccess: refresh,
    }),
  };
}
