/**
 * Carries "why your session ended" across the full page reload that follows a
 * sign-out (DEC-232). sessionStorage: this tab only, gone when the tab closes.
 * Storage can be blocked (private mode, settings), so every access is guarded.
 */
const KEY = "jp-interio-ended-reason";

export function saveEndedReason(reason: string | null): void {
  try {
    if (reason) sessionStorage.setItem(KEY, reason);
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the login page simply shows no message.
  }
}

/** Reads the saved reason once and removes it. */
export function takeEndedReason(): string | null {
  try {
    const reason = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return reason;
  } catch {
    return null;
  }
}
