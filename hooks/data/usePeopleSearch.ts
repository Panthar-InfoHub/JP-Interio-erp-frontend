"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCan } from "@/hooks/auth/usePermission";
import { getPage } from "@/lib/api/paged";
import { queryKeys } from "@/lib/query/queryKeys";
import type { components as UserSchemas } from "@/types/api/users";
import type { Staff } from "@/types/staff";

type PickerItem = UserSchemas["schemas"]["PickerItem"];

/** "asm" = ASMs only; "handler" = ASMs and Sales Executives (who handle requests). */
export type PeopleKind = "asm" | "handler";

export interface PersonOption {
  id: string;
  name: string | null;
  role: "asm" | "sales_executive";
  zoneName: string | null;
}

/** How many people one search shows (the rest: type more). */
export const PEOPLE_SEARCH_LIMIT = 20;

const isFieldRole = (key: string): key is PersonOption["role"] =>
  key === "asm" || key === "sales_executive";

/**
 * Active ASMs (or ASMs + Sales Executives) matching a name, A → Z, for a filter
 * (DEC-281). Uses the staff picker (`users.pick`: Admin, Tasks / Requests Sub-Admin) or,
 * without it, the staff list (`users.view`: the Zonal Head's own zone). Off for anyone
 * with neither. `zoneId` narrows to one zone.
 */
export function usePeopleSearch(
  kind: PeopleKind,
  search: string,
  zoneId: string | null,
  enabled = true,
) {
  const can = useCan();
  const source = can("users.pick") ? "picker" : can("users.view") ? "users" : null;
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
        return {
          items: page.items
            .filter((item) => isFieldRole(item.role.key))
            .map((item) => ({
              id: item.id,
              name: item.name,
              role: item.role.key as PersonOption["role"],
              zoneName: item.zone?.name ?? null,
            })),
          total: page.meta.total,
        };
      }
      const page = await getPage<Staff>("/users", { ...common, status: "active" });
      return {
        items: page.items
          .filter((item) => isFieldRole(item.role.key))
          .map((item) => ({
            id: item.id,
            name: item.name,
            role: item.role.key as PersonOption["role"],
            zoneName: item.zone?.name ?? null,
          })),
        total: page.meta.total,
      };
    },
  });
}
