"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the Staff list; the previous page stays on screen while the next loads. */
export function useStaffList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => usersApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/** The org tree (one request, drawn whole: it is not a paged list). */
export function useOrgTree() {
  return useQuery({ queryKey: queryKeys.users.orgTree, queryFn: usersApi.orgTree });
}

/** One staff member. A 404 (no such person, or out of view) is not retried. */
export function useStaffMember(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.get(id),
  });
}
