"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsApi } from "@/lib/api/settings.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** Every setting (a short fixed list, no paging). */
export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings.all, queryFn: settingsApi.list });
}

/**
 * Change one setting. Afterwards refresh the settings and the dashboard (the dormant-days
 * setting changes its numbers, DEC-201).
 */
export function useSettingActions() {
  const queryClient = useQueryClient();
  return {
    update: useMutation({
      mutationFn: ({ key, value }: { key: string; value: number }) =>
        settingsApi.update(key, value),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      },
    }),
  };
}
