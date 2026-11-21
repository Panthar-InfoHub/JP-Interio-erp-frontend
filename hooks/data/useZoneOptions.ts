"use client";

import { useQuery } from "@tanstack/react-query";

import { zonesApi } from "@/lib/api/zones.api";
import { queryKeys } from "@/lib/query/queryKeys";

/**
 * Active zones, A → Z, for pickers and filters. Zones change rarely, so one fetch is
 * shared by every picker for 5 minutes. (100 is the server's page maximum.)
 */
export function useZoneOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.zones.options,
    queryFn: async () =>
      (await zonesApi.list({ status: "active", sort: "name", limit: 100 })).items,
    staleTime: 5 * 60_000,
    enabled,
  });
}
