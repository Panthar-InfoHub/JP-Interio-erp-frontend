"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCan } from "@/hooks/auth/usePermission";
import { getPage } from "@/lib/api/paged";
import { queryKeys } from "@/lib/query/queryKeys";
import type { components as UserSchemas } from "@/types/api/users";
import type { RoleKey } from "@/types/auth";
import type { Staff } from "@/types/staff";

type PickerItem = UserSchemas["schemas"]["PickerItem"];

/**
 * "asm" = ASMs only; "handler" = ASMs and Sales Executives (who handle requests);
 * "staff" = anyone the lookup returns (task doers / givers, DEC-290).
 */
export type PeopleKind = "asm" | "handler" | "staff";

export interface PersonOption {
  id: string;
  name: string | null;
  role: RoleKey;
  zoneName: string | null;
}

/** How many people one search shows (the rest: type more). */
export const PEOPLE_SEARCH_LIMIT = 20;

const STAFF_ROLES: readonly string[] = [
  "admin",
  "sub_admin",
  "zonal_head",
  "asm",
  "sales_executive",
];

function fitsKind(kind: PeopleKind, key: string): key is RoleKey {
  if (kind === "staff") return STAFF_ROLES.includes(key);
  return key === "asm" || key === "sales_executive";
}

type LookupItem = {
  id: string;
  name: string | null;
  role: { key: string };
  zone?: { name: string } | null;
};

function toOptions(kind: PeopleKind, items: LookupItem[]): PersonOption[] {
  return items
    .filter((item) => fitsKind(kind, item.role.key))
    .map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role.key as RoleKey,
      zoneName: item.zone?.name ?? null,
    }));
}

/**
 * Active people matching a name, A → Z, for a filter (DEC-281, DEC-290). Uses the staff
 * picker (`users.pick`: Admin, Tasks / Requests Sub-Admin; Zonal Heads, ASMs and SEs only)
 * or, without it, the staff list (`users.view`: the Zonal Head's own zone). The Admin has
 * both and uses the staff list for "staff", so every role can be picked. Off for anyone
 * with neither. `zoneId` narrows to one zone.
 */
export function usePeopleSearch(
  kind: PeopleKind,
  search: string,
  zoneId: string | null,
  enabled = true,
) {
  const can = useCan();
  // "staff" prefers the full staff list (it also has Sub-Admins and the Admin).
  const source =
    kind === "staff" && can("users.view")
      ? "users"
      : can("users.pick")
        ? "picker"
        : can("users.view")
          ? "users"
          : null;
  const term = search.trim();

  return useQuery({
    queryKey: queryKeys.people.search(`${kind}:${source}`, zoneId, term),
    enabled: enabled && source !== null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    queryFn: async (): Promise<{ items: PersonOption[]; total: number }> => {
      const common = {
        search: term || undefined,
        zoneId: zoneId ?? undefined,
        sort: "name",
        limit: PEOPLE_SEARCH_LIMIT,
        role: kind === "asm" ? "asm" : undefined,
      };
      if (source === "picker") {
        const page = await getPage<PickerItem>("/users/picker", common);
        return { items: toOptions(kind, page.items), total: page.meta.total };
      }
      const page = await getPage<Staff>("/users", { ...common, status: "active" });
      return { items: toOptions(kind, page.items), total: page.meta.total };
    },
  });
}
