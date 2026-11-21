"use client";

import type { ReactNode } from "react";

import { NoZoneMessage } from "@/components/common/NoZoneMessage";
import { NotFoundState } from "@/components/common/StateMessages";
import { useNeedsZone } from "@/hooks/auth/useNeedsZone";
import { useCanAny } from "@/hooks/auth/usePermission";
import type { Capability } from "@/lib/auth/permissions";

/**
 * Wrap every panel page that needs an action.
 * - Without the action: "Not found" (the same answer the server gives for things out
 *   of scope). Only a screen helper: the server checks every request anyway.
 * - A Zonal Head with no zone: "You aren't assigned to a zone yet" (DEC-238), unless
 *   the page works without a zone (`zoneFree`, e.g. My tasks).
 */
export function RequirePermission({
  anyOf,
  zoneFree = false,
  children,
}: {
  anyOf: readonly Capability[];
  /** The page works for a Zonal Head with no zone (their own tasks, profile). */
  zoneFree?: boolean;
  children: ReactNode;
}) {
  const allowed = useCanAny(anyOf);
  const needsZone = useNeedsZone();

  if (!allowed) return <NotFoundState />;
  if (needsZone && !zoneFree) return <NoZoneMessage />;
  return children;
}
