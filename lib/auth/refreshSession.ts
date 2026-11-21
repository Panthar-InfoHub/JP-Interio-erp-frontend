import axios from "axios";

import { toApiError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiSuccess } from "@/types/api-response";
import type { WebLoginResult } from "@/types/auth";

/**
 * Swaps the jp_refresh cookie for a new access token (and a new cookie).
 *
 * Two refreshes at the same time would send the same cookie twice, and the server
 * would end the session as stolen (DEC-036). So:
 * - inside one tab, every caller shares the one refresh that is already running;
 * - across tabs, the Web Locks API lets only one tab refresh at a time. The next tab
 *   waits, then refreshes with the new cookie the first one received.
 *
 * Uses plain axios (not apiClient), so a refresh never triggers another refresh.
 */
let inFlight: Promise<string> | null = null;

const LOCK_NAME = "jp-interio-auth-refresh";

export function refreshAccessToken(): Promise<string> {
  inFlight ??= runExclusive(requestNewToken).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function requestNewToken(): Promise<string> {
  try {
    const response = await axios.post<ApiSuccess<WebLoginResult>>(
      `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      undefined,
      { withCredentials: true, timeout: 30_000 },
    );
    const token = response.data.data.accessToken;
    useAuthStore.getState().setAccessToken(token);
    return token;
  } catch (error) {
    throw toApiError(error);
  }
}

async function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    // The lock is held until `task` settles; the result passes through.
    return (await navigator.locks.request(LOCK_NAME, task)) as T;
  }
  // Very old browsers: one refresh per tab is still guaranteed by `inFlight`.
  return task();
}
