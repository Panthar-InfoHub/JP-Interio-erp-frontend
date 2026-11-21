import { create } from "zustand";

import type { Me, MyPermissions } from "@/types/auth";

/**
 * - `checking`: the panel is still finding out whether a session exists (page load).
 * - `signedIn`: token, user and permissions are loaded.
 * - `signedOut`: no session; the person must log in.
 * - `unreachable`: the server could not be reached while checking; show "try again".
 */
export type AuthStatus = "checking" | "signedIn" | "signedOut" | "unreachable";

interface AuthState {
  status: AuthStatus;
  /** In memory only (never localStorage). Comes back from the refresh cookie on reload. */
  accessToken: string | null;
  user: Me | null;
  permissions: MyPermissions | null;
  /** Why the session ended (shown on the login page), or null for a normal logout. */
  endedReason: string | null;
  /**
   * True once someone was signed in during this page's life. When that session ends,
   * the panel reloads the page fully, so nothing of that person stays in memory
   * (Next.js keeps visited pages alive with their state, DEC-232).
   */
  hadSession: boolean;

  setAccessToken: (token: string) => void;
  setUser: (user: Me) => void;
  signIn: (user: Me, permissions: MyPermissions) => void;
  setChecking: () => void;
  setUnreachable: () => void;
  endSession: (reason?: string | null) => void;
  setEndedReason: (reason: string | null) => void;
  clearEndedReason: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "checking",
  accessToken: null,
  user: null,
  permissions: null,
  endedReason: null,
  hadSession: false,

  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  signIn: (user, permissions) =>
    set({ status: "signedIn", user, permissions, endedReason: null, hadSession: true }),
  setChecking: () => set({ status: "checking" }),
  setUnreachable: () => set({ status: "unreachable" }),
  endSession: (reason = null) =>
    set({
      status: "signedOut",
      accessToken: null,
      user: null,
      permissions: null,
      endedReason: reason,
    }),
  setEndedReason: (endedReason) => set({ endedReason }),
  clearEndedReason: () => set({ endedReason: null }),
}));
