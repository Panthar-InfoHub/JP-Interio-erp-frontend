"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { partnersApi } from "@/lib/api/partners.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the Partners list; the previous page stays on screen while the next loads. */
export function usePartnerList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.partners.list(query),
    queryFn: () => partnersApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/** Partner 360. A 404 (no such partner, or out of scope) is not retried. */
export function usePartner(id: string) {
  return useQuery({
    queryKey: queryKeys.partners.detail(id),
    queryFn: () => partnersApi.get(id),
  });
}
