"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketsApi, type TicketStatusChange } from "@/lib/api/tickets.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the ticket queue + the counts; the previous page stays while the next loads. */
export function useTicketQueue(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.tickets.queue(query),
    queryFn: () => ticketsApi.queue(query),
    placeholderData: keepPreviousData,
  });
}

/** One ticket in full (ticket page). */
export function useTicket(id: string) {
  return useQuery({ queryKey: queryKeys.tickets.detail(id), queryFn: () => ticketsApi.get(id) });
}

/** The 6 category codes and names (a fixed list on the server). */
export function useTicketCategories() {
  return useQuery({
    queryKey: queryKeys.tickets.categories,
    queryFn: ticketsApi.categories,
    staleTime: Infinity,
  });
}

/**
 * Change a ticket's status. Afterwards refresh the queue, the ticket and Partner 360 (its
 * `tickets` box counts). Not awaited, so the caller's message always runs (as for tasks).
 */
export function useTicketActions() {
  const queryClient = useQueryClient();
  return {
    changeStatus: useMutation({
      mutationFn: ({ id, input }: { id: string; input: TicketStatusChange }) =>
        ticketsApi.changeStatus(id, input),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.partners.all });
      },
    }),
  };
}
