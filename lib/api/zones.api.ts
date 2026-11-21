import { getPage } from "@/lib/api/paged";
import type { components } from "@/types/api/zones";

export type Zone = components["schemas"]["Zone"];

export interface ListZonesParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: "active" | "inactive";
  search?: string;
}

/** Zones (docs/api/zones.openapi.yaml). Every staff role may list them. */
export const zonesApi = {
  list: (params: ListZonesParams) => getPage<Zone>("/zones", { ...params }),
};
