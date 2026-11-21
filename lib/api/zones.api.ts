import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type { components } from "@/types/api/zones";

export type Zone = components["schemas"]["Zone"];
export type ZoneCreate = components["schemas"]["ZoneCreate"];
/** Send only what changes (the generated type marks every field as required). */
export type ZoneUpdate = Partial<components["schemas"]["ZoneUpdate"]>;

export interface ListZonesParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: "active" | "inactive";
  search?: string;
}

const base = (id: string) => `/zones/${encodeURIComponent(id)}`;

/**
 * Zones (docs/api/zones.openapi.yaml). Every staff role may list them; every change is
 * Admin only (`zones.manage`) and audited by the server.
 */
export const zonesApi = {
  list: (params: ListZonesParams | ListQuery) => getPage<Zone>("/zones", { ...params }),

  /** Code is saved in CAPITALS; code and name must be unique (409 CONFLICT). */
  create: async (input: ZoneCreate) =>
    (await apiClient.post<ApiSuccess<Zone>>("/zones", input)).data,

  /** Send only what changes. `null` clears region / state. Code locked once used (409). */
  update: async (id: string, changes: ZoneUpdate) =>
    (await apiClient.patch<ApiSuccess<Zone>>(base(id), changes)).data,

  /** Only an empty zone (409 CONFLICT while anyone not deactivated is in it). */
  deactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Zone>>(`${base(id)}/deactivate`)).data,

  reactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Zone>>(`${base(id)}/reactivate`)).data,

  /**
   * Put an active Zonal Head with no zone in charge (fills an empty zone or replaces the
   * current one). The zone's ASMs follow; the old head keeps no zone. 409 OPEN_TASKS while
   * the old head has unfinished tasks.
   */
  setZonalHead: async (id: string, userId: string) =>
    (await apiClient.post<ApiSuccess<Zone>>(`${base(id)}/zonal-head`, { userId })).data,
};
