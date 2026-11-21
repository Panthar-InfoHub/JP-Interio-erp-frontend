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

/** GET a paged list (every list endpoint uses `page`, `limit`, `sort`, R13). */
export async function getPage<T>(url: string, params: ListQuery): Promise<Page<T>> {
  const response = await apiClient.get<ApiSuccess<T[]>>(url, { params: clean(params) });
  const meta = (response.data.meta ?? {}) as Partial<PageMeta>;
  return {
    items: response.data.data,
    meta: {
      page: meta.page ?? 1,
      limit: meta.limit ?? response.data.data.length,
      total: meta.total ?? response.data.data.length,
      totalPages: meta.totalPages ?? 1,
    },
  };
}
