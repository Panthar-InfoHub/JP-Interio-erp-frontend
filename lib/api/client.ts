import axios, { isAxiosError } from "axios";

import { toApiError } from "@/lib/api/errors";
import { refreshAccessToken } from "@/lib/auth/refreshSession";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth.store";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Never try a token refresh for this call (login steps). */
    skipAuthRefresh?: boolean;
    /** Set after one refresh + retry, so a call is retried at most once. */
    retriedAfterRefresh?: boolean;
  }
}

/**
 * The one axios instance for the whole console.
 * - Sends the access token as "Authorization: Bearer …".
 * - withCredentials, so the browser sends the jp_refresh cookie to /api/auth.
 * - 401 ACCESS_TOKEN_INVALID → one refresh (shared, see refreshSession.ts), then the
 *   call is repeated once. If the refresh fails, the session ends.
 * - Every failure becomes an ApiError (lib/api/errors.ts).
 */
export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

/** Codes that mean "this session is over": go to login. */
const SESSION_OVER_CODES = new Set(["UNAUTHORIZED", "SESSION_ENDED", "ACCOUNT_INACTIVE"]);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // File downloads ask for a Blob; their error body is then JSON inside a Blob.
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // Not JSON: toApiError gives the general message.
      }
    }
    const apiError = toApiError(error);
    const config = isAxiosError(error) ? error.config : undefined;

    if (!config || config.skipAuthRefresh) throw apiError;

    if (
      apiError.status === 401 &&
      apiError.code === "ACCESS_TOKEN_INVALID" &&
      !config.retriedAfterRefresh
    ) {
      config.retriedAfterRefresh = true;
      try {
        await refreshAccessToken();
      } catch (refreshError) {
        const failed = toApiError(refreshError);
        // A network blip or server error is not a dead session: keep the person
        // signed in and let the screen show "try again".
        if (failed.status !== 0 && failed.status < 500) {
          useAuthStore.getState().endSession(failed.message);
        }
        throw failed;
      }
      return apiClient(config);
    }

    if (SESSION_OVER_CODES.has(apiError.code)) {
      useAuthStore.getState().endSession(apiError.message);
    }

    throw apiError;
  },
);
