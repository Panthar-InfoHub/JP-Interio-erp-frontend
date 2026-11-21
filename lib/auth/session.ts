import { authApi } from "@/lib/api/auth.api";
import { isApiError } from "@/lib/api/errors";
import { refreshAccessToken } from "@/lib/auth/refreshSession";
import { useAuthStore } from "@/stores/auth.store";

/** Loads me + my permissions (in parallel) and marks the person as signed in. */
export async function loadSignedInUser(): Promise<void> {
  const [user, permissions] = await Promise.all([authApi.getMe(), authApi.getMyPermissions()]);
  useAuthStore.getState().signIn(user, permissions);
}

let restoring: Promise<void> | null = null;

/**
 * On page load: is there still a session? Uses the refresh cookie to get a token,
 * then loads the person. Runs once even if several components ask at the same time.
 * - no / dead cookie → signedOut (normal, no message);
 * - server not reachable → unreachable ("try again").
 */
export function ensureSession(): Promise<void> {
  restoring ??= restore().finally(() => {
    restoring = null;
  });
  return restoring;
}

async function restore(): Promise<void> {
  const store = useAuthStore.getState();
  if (store.status === "signedIn") return;
  store.setChecking();

  try {
    await refreshAccessToken();
    await loadSignedInUser();
  } catch (error) {
    if (isApiError(error) && (error.status === 0 || error.status >= 500)) {
      useAuthStore.getState().setUnreachable();
    } else {
      useAuthStore.getState().endSession(null);
    }
  }
}
