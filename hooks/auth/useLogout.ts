"use client";

import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/lib/api/auth.api";
import { announceSignedOut } from "@/lib/auth/authChannel";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Log out this device (or every device with `everywhere`).
 * The local session is cleared even if the server call fails: the person asked to
 * leave, and the server session ends by itself when its time runs out.
 * AuthGate then empties the data cache and opens the login page.
 */
export function useLogout() {
  return useMutation({
    mutationFn: async ({ everywhere = false }: { everywhere?: boolean } = {}) => {
      try {
        if (everywhere) await authApi.logoutAll();
        else await authApi.logout();
      } catch {
        // Ignored on purpose (see above).
      }
    },
    onSettled: () => {
      useAuthStore.getState().endSession(null);
      announceSignedOut();
    },
  });
}
