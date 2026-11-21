import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, PageMeta } from "@/types/api-response";

/** One page of a list endpoint: the rows plus `meta` (page, limit, total, totalPages). */
export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

/** Query values; empty ones (null, undefined, "") are left out of the address. */
export type ListQuery = Record<string, string | number | boolean | null | undefined>;

function clean(params: ListQuery): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") result[key] = value;
  }
  return result;
}

/** A page whose `meta` also carries `totals` for the whole filter (ledger, scans). */
export interface PageWithTotals<T, Totals> extends Page<T> {
  totals: Totals | null;
}

async function fetchPage<T>(url: string, params: ListQuery) {
  const response = await apiClient.get<ApiSuccess<T[]>>(url, { params: clean(params) });
  const meta = (response.data.meta ?? {}) as Partial<PageMeta> & { totals?: unknown };
  const page: Page<T> = {
    items: response.data.data,
    meta: {
      page: meta.page ?? 1,
      limit: meta.limit ?? response.data.data.length,
      total: meta.total ?? response.data.data.length,
      totalPages: meta.totalPages ?? 1,
    },
  };
  return { page, totals: meta.totals };
}

/** GET a paged list (every list endpoint uses `page`, `limit`, `sort`, R13). */
export async function getPage<T>(url: string, params: ListQuery): Promise<Page<T>> {
  return (await fetchPage<T>(url, params)).page;
}

/** GET a paged list that also sends `meta.totals` (the ledger and scan lists). */
export async function getPageWithTotals<T, Totals>(
  url: string,
  params: ListQuery,
): Promise<PageWithTotals<T, Totals>> {
  const { page, totals } = await fetchPage<T>(url, params);
  return { ...page, totals: (totals as Totals | undefined) ?? null };
}
