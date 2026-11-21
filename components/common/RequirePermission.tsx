"use client";

import type { ReactNode } from "react";

import { NotFoundState } from "@/components/common/StateMessages";
import { useCanAny } from "@/hooks/auth/usePermission";
import type { Capability } from "@/lib/auth/permissions";

/**
 * Wrap a page (or part of one) that needs an action. Without it, the person sees
 * "Not found" — the same answer the server gives for things out of scope.
 * Only a screen helper: the server checks every request anyway.
 */
export function RequirePermission({
  anyOf,
  children,
}: {
  anyOf: readonly Capability[];
  children: ReactNode;
}) {
  const allowed = useCanAny(anyOf);
  return allowed ? children : <NotFoundState />;
}
