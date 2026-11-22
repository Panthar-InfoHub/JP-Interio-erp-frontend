"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { requestsApi } from "@/lib/api/requests.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One partner's requests for the Partner 360 tab: counts + one page of the list. */
export function usePartnerRequests(partnerId: string, query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.requests.partner(partnerId, query),
    queryFn: () => requestsApi.partnerHistory(partnerId, query),
    placeholderData: keepPreviousData,
  });
}

/** One request in full (details page). */
export function useRequest(id: string) {
  return useQuery({ queryKey: queryKeys.requests.detail(id), queryFn: () => requestsApi.get(id) });
}

/** One page of the all-requests list; the previous page stays on screen while the next loads. */
export function useRequestList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.requests.list(query),
    queryFn: () => requestsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
