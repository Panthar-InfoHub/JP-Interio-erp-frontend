"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { subAdminsApi, type Area } from "@/lib/api/subAdmins.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** Every Sub-Admin (a short list the server sends whole). */
export function useSubAdmins() {
  return useQuery({ queryKey: queryKeys.subAdmins.list, queryFn: subAdminsApi.list });
}

/** One Sub-Admin's areas with who gave them (loaded while the pop-up is open). */
export function useSubAdminAreas(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.subAdmins.areas(id),
    queryFn: () => subAdminsApi.areas(id),
    enabled,
  });
}

/**
 * Set a Sub-Admin's areas. Afterwards refresh the Sub-Admin list / areas and the staff data
 * (staff pages show the areas). Not awaited, so the caller's message always runs.
 */
export function useSubAdminActions() {
  const queryClient = useQueryClient();
  return {
    setAreas: useMutation({
      mutationFn: ({ id, areas }: { id: string; areas: Area[] }) =>
        subAdminsApi.setAreas(id, areas),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.subAdmins.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      },
    }),
  };
}
