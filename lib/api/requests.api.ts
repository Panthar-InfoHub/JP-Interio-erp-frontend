import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess, PageMeta } from "@/types/api-response";
import type {
  components as PartnerComponents,
  operations as PartnerOperations,
} from "@/types/api/partners";
import type { components } from "@/types/api/requests";

type Schemas = components["schemas"];
type HistoryData = NonNullable<
  PartnerOperations["listPartnerRequests"]["responses"][200]["content"]["application/json"]["data"]
>;

/** One request in a partner's history (partners.openapi.yaml 0.10.1). */
export type PartnerRequestRow = PartnerComponents["schemas"]["PartnerRequestRow"];
/** The counts above a partner's history: they ignore the filters (DEC-173). */
export type PartnerRequestCounts = NonNullable<HistoryData["counts"]>;
/**
 * What every request list row has (the all-requests rows also carry the partner's zone),
 * so one set of columns serves both lists.
 */
export type RequestListRow = PartnerRequestRow & {
  zone?: { id: string; name: string } | null;
};

export type RequestStatus = Schemas["RequestStatus"];
export type RequestCategory = Schemas["StaffRequestRow"]["category"];
/** One row of the all-requests list: the staff row plus the partner's current zone. */
export type RequestRow = Schemas["AllRequestsRow"];
/** One request in full for staff: items, money, reasons and the whole timeline. */
export type RequestDetail = Schemas["StaffRequest"];
export type RequestMoney = NonNullable<Schemas["MoneyRecord"]>;
export type RequestTimelineEntry = RequestDetail["timeline"][number];
export type PayMode = RequestMoney["mode"];

/**
 * Shipment / sample requests for staff (docs/api/requests.openapi.yaml 0.2.0, Module 11).
 * The panel is view only (DEC-164): Admin and the Requests Sub-Admin see all, a Zonal
 * Head the partners now in their zone. Out of scope → 404.
 */
export const requestsApi = {
  /**
   * `GET /requests` (web panel only, DEC-279, DEC-280). All states by default; filters
   * state, status, category, zoneId, handlerId, asmId, search, from / to; sort createdAt /
   * updatedAt. A filter outside my scope gives an empty list.
   */
  list: (query: ListQuery) => getPage<RequestRow>("/requests", { ...query }),

  /**
   * `GET /partners/{id}/requests` (Partner 360 tab): the counts of this partner's requests I
   * may see, and one filtered page (state all by default, status, category), newest first.
   */
  partnerHistory: async (partnerId: string, query: ListQuery) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    );
    const response = await apiClient.get<ApiSuccess<HistoryData>>(
      `/partners/${encodeURIComponent(partnerId)}/requests`,
      { params },
    );
    const data = response.data.data;
    const items = (data.items ?? []) as PartnerRequestRow[];
    const meta = (response.data.meta ?? {}) as Partial<PageMeta>;
    return {
      counts: data.counts ?? null,
      items,
      meta: {
        page: meta.page ?? 1,
        limit: meta.limit ?? items.length,
        total: meta.total ?? items.length,
        totalPages: meta.totalPages ?? 1,
      },
    };
  },

  /** `GET /requests/{id}`: everything, within my scope (else 404). Staff apps only. */
  get: async (id: string) =>
    (await apiClient.get<ApiSuccess<RequestDetail>>(`/requests/${encodeURIComponent(id)}`)).data
      .data,
};
