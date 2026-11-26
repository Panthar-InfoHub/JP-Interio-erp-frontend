import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/api-response";
import type { components } from "@/types/api/settings-permissions";

type Schemas = components["schemas"];

/** One setting: value, limits, default, read-only flag, who changed it last. */
export type Setting = Schemas["Setting"];

/**
 * System settings (docs/api/settings-permissions.openapi.yaml, Module 3, DEC-054). Admin only.
 * A change applies straight away; the same value again → `changed: false` ("No change").
 */
export const settingsApi = {
  /** `GET /settings`: every setting with its limits. */
  list: async () => (await apiClient.get<ApiSuccess<Setting[]>>("/settings")).data.data,

  /** `PATCH /settings/{key}`: a whole number inside min – max; `otp.length` → 400 read-only. */
  update: async (key: string, value: number) =>
    (
      await apiClient.patch<ApiSuccess<Setting & { changed: boolean }>>(
        `/settings/${encodeURIComponent(key)}`,
        { value },
      )
    ).data,
};
