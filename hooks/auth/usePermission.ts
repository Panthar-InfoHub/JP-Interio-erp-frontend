"use client";

import { useCallback } from "react";

import { hasAnyPermission, hasPermission, scopeOf, type Capability } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";

/** `const can = useCan(); can("payouts.approve")` — for showing / hiding things only. */
export function useCan() {
  const permissions = useAuthStore((state) => state.permissions);
  return useCallback((action: Capability) => hasPermission(permissions, action), [permissions]);
}

/** True if any of the actions is allowed. */
export function useCanAny(actions: readonly Capability[]): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return hasAnyPermission(permissions, actions);
}

/** The scope of one action for me (`full`, `scoped`, `own`) or null. */
export function useScope(action: Capability) {
  const permissions = useAuthStore((state) => state.permissions);
  return scopeOf(permissions, action);
}
