import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/api-response";
import type { components } from "@/types/api/settings-permissions";

type Schemas = components["schemas"];

/** One Sub-Admin with their area codes (list). */
export type SubAdmin = Schemas["SubAdminSummary"];
/** One Sub-Admin's areas with who gave each one and when. */
export type SubAdminAreas = Schemas["SubAdminAreas"];
export type Area = Schemas["Area"];

const base = (id: string) => `/sub-admins/${encodeURIComponent(id)}/areas`;

/**
 * Sub-Admin areas (docs/api/settings-permissions.openapi.yaml, Module 3, DEC-019). Admin only.
 * A change applies on the Sub-Admin's next request; their menus on their next panel load.
 */
export const subAdminsApi = {
  /** `GET /sub-admins`: every Sub-Admin (any status), oldest first, whole list (no paging). */
  list: async () => (await apiClient.get<ApiSuccess<SubAdmin[]>>("/sub-admins")).data.data,

  /** `GET /sub-admins/{id}/areas`: the areas with grantedAt / grantedBy. */
  areas: async (id: string) => (await apiClient.get<ApiSuccess<SubAdminAreas>>(base(id))).data.data,

  /** `PUT /sub-admins/{id}/areas`: the FULL new list (empty allowed). Same list → `changed: false`. */
  setAreas: async (id: string, areas: Area[]) =>
    (await apiClient.put<ApiSuccess<SubAdminAreas & { changed: boolean }>>(base(id), { areas }))
      .data,
};
