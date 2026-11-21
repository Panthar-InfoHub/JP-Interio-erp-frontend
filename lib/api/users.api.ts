import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type { OrgTree } from "@/types/org";
import type { Staff, StaffChanges, StaffCreateInput, StaffDetail } from "@/types/staff";

export interface StaffOption {
  id: string;
  name: string | null;
  phone: string;
  zone: { id: string; name: string } | null;
}

const base = (id: string) => `/users/${encodeURIComponent(id)}`;

/**
 * Staff (docs/api/users.openapi.yaml). `GET /users` needs `users.view` (Admin, Zonal Head).
 * The server limits what each role sees (Zonal Head: their zone); others are 404.
 */
export const usersApi = {
  /** Staff list. Filters: role, zoneId, status, managerId, search. All statuses by default. */
  list: (query: ListQuery) => getPage<Staff>("/users", query),

  /** One staff member with team counts and task numbers. Out of view → 404. */
  get: async (id: string) => (await apiClient.get<ApiSuccess<StaffDetail>>(base(id))).data.data,

  /** The hierarchy (active and suspended people, active zones). Admin: all; Zonal Head: zone. */
  orgTree: async () => (await apiClient.get<ApiSuccess<OrgTree>>("/org/tree")).data.data,

  // ---- T3: changes (the server checks the tier, the zone and every rule again) ----

  /** Add staff. Who may add whom and the extra field per role: users.openapi.yaml. */
  create: async (input: StaffCreateInput) =>
    (await apiClient.post<ApiSuccess<Staff>>("/users", input)).data,

  /** Name, phone, email (send only what changes). A new phone logs the person out. */
  update: async (id: string, changes: StaffChanges) =>
    (await apiClient.patch<ApiSuccess<Staff>>(base(id), changes)).data,

  /** Logged out at once. 409 OPEN_TASKS / OPEN_REQUESTS / CONFLICT (team, zone in charge). */
  deactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Staff>>(`${base(id)}/deactivate`)).data,

  /** 409 when their manager or zone is not active, or the zone has another Zonal Head. */
  reactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Staff>>(`${base(id)}/reactivate`)).data,

  /** Exactly one of `asmId` (a Sales Executive) or `zoneId` (an ASM, Admin only). */
  transfer: async (id: string, target: { asmId: string } | { zoneId: string }) =>
    (await apiClient.post<ApiSuccess<Staff>>(`${base(id)}/transfer`, target)).data,

  /** Active staff of one role, A → Z (100 = the server's page maximum). */
  listByRole: (role: "admin" | "sub_admin" | "zonal_head") =>
    getPage<StaffOption>("/users", { role, status: "active", sort: "name", limit: 100 }),

  /** Active ASMs, A → Z, optionally in one zone (100 = the server's page maximum). */
  listAsms: (zoneId?: string | null) =>
    getPage<StaffOption>("/users", {
      role: "asm",
      status: "active",
      sort: "name",
      limit: 100,
      zoneId: zoneId ?? undefined,
    }),
};
