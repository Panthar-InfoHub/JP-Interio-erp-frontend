import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type {
  MarkPaidInput,
  PaidDetailsChanges,
  PayoutStepResult,
  StaffPayout,
  StaffPayoutDetail,
} from "@/types/payout";

const base = (id: string) => `/payouts/${encodeURIComponent(id)}`;

const post = async (url: string, body?: object) =>
  (await apiClient.post<ApiSuccess<PayoutStepResult>>(url, body ?? {})).data;

/**
 * Payouts for staff (docs/api/payouts.openapi.yaml). Admin and the Rewards Sub-Admin see
 * all zones, a Zonal Head their zone, by the partner's current zone; out of scope → 404.
 *
 * Steps (each answers 200 with `alreadyDone: true` when pressed twice):
 * - a step the status doesn't allow → 409 PAYOUT_WRONG_STATUS (`details.status` = now);
 * - a frozen wallet → 409 WALLET_FROZEN: the payout waits (DEC-149).
 */
export const payoutsApi = {
  /**
   * Newest first, paged, no totals. `status=requested` is the approval queue,
   * `status=approved` the payment worklist. `from` / `to` = when the partner asked.
   */
  list: (query: ListQuery) => getPage<StaffPayout>("/payouts", query),

  get: async (id: string) =>
    (await apiClient.get<ApiSuccess<StaffPayoutDetail>>(base(id))).data.data,

  /** requested → approved (`payouts.approve`). Points stay held. */
  approve: (id: string) => post(`${base(id)}/approve`),

  /** requested / approved → declined (`payouts.approve`). Reason 10 – 500, shown to the partner. */
  decline: (id: string, reason: string) => post(`${base(id)}/decline`, { reason }),

  /** approved → paid (`payouts.mark_paid`). Paid time = now. */
  markPaid: (id: string, input: MarkPaidInput) => post(`${base(id)}/mark-paid`, input),

  /** Only while paid (`payouts.mark_paid`). Send only what changes. */
  editPaidDetails: async (id: string, changes: PaidDetailsChanges) =>
    (await apiClient.patch<ApiSuccess<PayoutStepResult>>(`${base(id)}/paid-details`, changes)).data,

  /** paid → failed, final (`payouts.approve`). Reason 10 – 500; the points go back. */
  markFailed: (id: string, reason: string) => post(`${base(id)}/mark-failed`, { reason }),
};
