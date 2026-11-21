/** Every TanStack Query key in one place, so screens refresh the right data. */
export const queryKeys = {
  auth: {
    sessions: ["auth", "sessions"] as const,
  },
  zones: {
    all: ["zones"] as const,
    /** Active zones for pickers and filters. */
    options: ["zones", "options"] as const,
  },
};
