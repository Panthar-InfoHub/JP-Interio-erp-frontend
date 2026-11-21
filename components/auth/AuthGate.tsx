"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { ServerUnreachable } from "@/components/auth/ServerUnreachable";
import { listenForSignOut } from "@/lib/auth/authChannel";
import { saveEndedReason } from "@/lib/auth/endedReason";
import { ensureSession } from "@/lib/auth/session";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Wraps every page inside the panel.
 * - On load: restores the session from the refresh cookie (once).
 * - No session: goes to /login; after login everyone lands on the dashboard (DEC-235).
 * - Another tab logs out: this tab leaves too.
 * - A session that ends (logout, expired, ended elsewhere) reloads the page fully, so
 *   memory, the data cache and every kept-alive page start empty for the next person.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "checking") void ensureSession();
  }, [status]);

  useEffect(() => {
    if (status !== "signedOut") return;
    // Every login starts on the dashboard, never the last page (DEC-235).
    const loginUrl = "/login";
    const { hadSession, endedReason } = useAuthStore.getState();

    if (hadSession) {
      // Someone was signed in: reload the page fully, so no page that Next.js kept
      // alive still holds their data or half-filled forms (DEC-232).
      saveEndedReason(endedReason);
      window.location.replace(loginUrl);
      return;
    }
    queryClient.clear();
    router.replace(loginUrl);
  }, [status, router, queryClient]);

  useEffect(() => listenForSignOut(() => useAuthStore.getState().endSession(null)), []);

  if (status === "signedIn") return children;
  if (status === "unreachable") return <ServerUnreachable onRetry={() => void ensureSession()} />;
  return <FullScreenLoader label={status === "signedOut" ? "Going to login…" : "Loading…"} />;
}
