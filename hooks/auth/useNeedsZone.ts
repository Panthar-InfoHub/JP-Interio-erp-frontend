"use client";

import { useAuthStore } from "@/stores/auth.store";

/**
 * True for a Zonal Head who has no zone yet. Everything they manage is "their zone",
 * so zone pages show NoZoneMessage instead of empty lists (DEC-238).
 */
export function useNeedsZone(): boolean {
  return useAuthStore((state) => state.user?.role.key === "zonal_head" && !state.user.zone);
}
