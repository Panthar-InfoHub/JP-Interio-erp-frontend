"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/** The server's limits for every list (backend/src/utils/pagination.ts). */
export const PAGE_SIZES = [20, 50, 100] as const;
const DEFAULT_LIMIT = 20;

interface ListParamsOptions<F extends string> {
  /** The sort to use when the address has none, e.g. "-createdAt". */
  defaultSort: string;
  /** Names of this list's own filters (e.g. "status", "zoneId", "from", "to"). */
  filters?: readonly F[];
}

export interface ListParams<F extends string> {
  page: number;
  limit: number;
  /** "field" = A → Z / oldest first, "-field" = reverse (one field, DEC-028). */
  sort: string;
  search: string;
  filters: Record<F, string | null>;
  /** Everything above in one object: put it in the query key and the request. */
  query: Record<string, string | number>;
  /** True when any search or filter is set. */
  isFiltered: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sort: string) => void;
  setSearch: (search: string) => void;
  /** Change several filters at once; goes back to page 1. */
  setFilters: (changes: Partial<Record<F, string | null>>) => void;
  /** Clears the search and every filter, except those named in `keep` (e.g. a tab). */
  clearFilters: (keep?: readonly F[]) => void;
}

/**
 * List state (page, page size, sort, search, filters) kept in the page address, so a
 * filtered list survives a reload and can be shared as a link.
 * Uses useSearchParams: the component using it needs a <Suspense> boundary above it.
 */
export function useListParams<F extends string = never>({
  defaultSort,
  filters: filterNames = [],
}: ListParamsOptions<F>): ListParams<F> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = (PAGE_SIZES as readonly number[]).includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;
  const sort = searchParams.get("sort") || defaultSort;
  const search = searchParams.get("search") ?? "";

  const filterKey = filterNames.join(",");
  const filters = useMemo(() => {
    const result = {} as Record<F, string | null>;
    for (const name of filterKey ? (filterKey.split(",") as F[]) : []) {
      result[name] = searchParams.get(name) || null;
    }
    return result;
  }, [filterKey, searchParams]);

  const update = useCallback(
    (changes: Record<string, string | number | null>, resetPage: boolean) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage) next.delete("page");
      if (next.get("sort") === defaultSort) next.delete("sort");
      if (next.get("limit") === String(DEFAULT_LIMIT)) next.delete("limit");
      if (next.get("page") === "1") next.delete("page");
      const text = next.toString();
      router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, defaultSort],
  );

  const query = useMemo(() => {
    const result: Record<string, string | number> = { page, limit, sort };
    if (search) result.search = search;
    for (const [key, value] of Object.entries(filters) as [F, string | null][]) {
      if (value) result[key] = value;
    }
    return result;
  }, [page, limit, sort, search, filters]);

  const isFiltered = Boolean(search) || Object.values(filters).some(Boolean);

  return {
    page,
    limit,
    sort,
    search,
    filters,
    query,
    isFiltered,
    setPage: (next) => update({ page: next }, false),
    setLimit: (next) => update({ limit: next }, true),
    setSort: (next) => update({ sort: next }, true),
    setSearch: (next) => update({ search: next }, true),
    setFilters: (changes) => update(changes as Record<string, string | null>, true),
    clearFilters: (keep = []) => {
      const cleared: Record<string, null> = { search: null };
      for (const name of Object.keys(filters) as F[]) {
        if (!keep.includes(name)) cleared[name] = null;
      }
      update(cleared, true);
    },
  };
}
