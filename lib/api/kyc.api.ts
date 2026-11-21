import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type { KycDetail, KycQueueItem } from "@/types/kyc";

const base = (id: string) => `/kyc/${encodeURIComponent(id)}`;

/**
 * KYC review (docs/api/kyc.openapi.yaml). Zonal Head: own zone; Partners Sub-Admin and
 * Admin: all zones. Undo a rejection: Admin only. Two checkers at once → the second gets
 * 409 KYC_WRONG_STATE ("Please refresh").
 */
export const kycApi = {
  /** `state` pending (default) / rejected / verified; oldest submission first. */
  queue: (query: ListQuery) => getPage<KycQueueItem>("/kyc/queue", query),

  get: async (id: string) => (await apiClient.get<ApiSuccess<KycDetail>>(base(id))).data.data,

  /** `asmId` only for a self sign-up (required then). */
  approve: async (id: string, asmId?: string) =>
    (await apiClient.post<ApiSuccess<KycDetail>>(`${base(id)}/approve`, asmId ? { asmId } : {}))
      .data,

  /** Final for the partner (DEC-073); the reason is shown in their app. */
  reject: async (id: string, reason: string) =>
    (await apiClient.post<ApiSuccess<KycDetail>>(`${base(id)}/reject`, { reason })).data,

  /** Admin only: back to Pending to be checked again (DEC-098). */
  undoRejection: async (id: string, reason: string) =>
    (await apiClient.post<ApiSuccess<KycDetail>>(`${base(id)}/undo-rejection`, { reason })).data,
};
