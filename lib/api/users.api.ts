import { getPage } from "@/lib/api/paged";

export interface StaffOption {
  id: string;
  name: string | null;
  zone: { id: string; name: string } | null;
}

/** Staff (docs/api/users.openapi.yaml). `GET /users` needs `users.view` (Admin, Zonal Head). */
export const usersApi = {
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
