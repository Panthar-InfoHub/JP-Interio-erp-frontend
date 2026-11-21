"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/lib/api/users.api";
import { zonesApi, type ZoneCreate, type ZoneUpdate } from "@/lib/api/zones.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the Zones list; the previous page stays on screen while the next loads. */
export function useZoneList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.zones.list(query),
    queryFn: () => zonesApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/**
 * Active Zonal Heads with no zone yet: the only ones the server lets the Admin put in
 * charge of a zone (DEC-067). Loaded only while the "Set Zonal Head" pop-up is open.
 */
export function useSpareZonalHeads(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.spareZonalHeads,
    queryFn: async () =>
      (await usersApi.listByRole("zonal_head")).items.filter((person) => person.zone === null),
    enabled,
  });
}

/**
 * Every zone change (Admin only). Afterwards refresh the zone lists and pickers, and the
 * staff data (a new Zonal Head moves the zone's ASMs, DEC-067).
 */
export function useZoneActions() {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    ]);
  };

  return {
    create: useMutation({
      mutationFn: (input: ZoneCreate) => zonesApi.create(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: ZoneUpdate }) =>
        zonesApi.update(id, changes),
      onSuccess: refresh,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => zonesApi.deactivate(id),
      onSuccess: refresh,
    }),
    reactivate: useMutation({
      mutationFn: (id: string) => zonesApi.reactivate(id),
      onSuccess: refresh,
    }),
    setZonalHead: useMutation({
      mutationFn: ({ id, userId }: { id: string; userId: string }) =>
        zonesApi.setZonalHead(id, userId),
      onSuccess: refresh,
    }),
  };
}
