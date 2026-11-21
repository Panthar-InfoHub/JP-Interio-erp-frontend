import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type {
  LookupInput,
  NumberHolder,
  Partner360,
  PartnerListItem,
  PartnerProfileChanges,
  PayoutAccount,
  PayoutAccountInput,
  PayoutAccountChanges,
} from "@/types/partner";

const base = (id: string) => `/partners/${encodeURIComponent(id)}`;
const account = (id: string, accountId: string) =>
  `${base(id)}/payout-accounts/${encodeURIComponent(accountId)}`;

/** Partners (docs/api/partners.openapi.yaml). Scope is applied by the server (R2). */
export const partnersApi = {
  /** Verified partners only (DEC-105). Filters: partnerType, zoneId, asmId, status, search. */
  list: (query: ListQuery) => getPage<PartnerListItem>("/partners", query),

  /** Partner 360, any state. Out of scope → 404 (shown as "Not found"). */
  get: async (id: string) => (await apiClient.get<ApiSuccess<Partner360>>(base(id))).data.data,

  // ---- T2: actions on a verified partner (DEC-103, DEC-242) ----

  /** Send only what changes. Reply: `{ changed }` + message ("No change" when nothing differed). */
  editProfile: async (id: string, changes: PartnerProfileChanges) =>
    (await apiClient.patch<ApiSuccess<{ changed: boolean }>>(`${base(id)}/profile`, changes)).data,

  /** No OTP; the partner is logged out of every device (DEC-074). */
  changePhone: async (id: string, phone: string) =>
    (
      await apiClient.post<ApiSuccess<{ phone: string; loggedOutSessions: number }>>(
        `${base(id)}/change-phone`,
        { phone },
      )
    ).data,

  /** Move to another ASM (Zonal Head: inside their zone; Admin: any zone). */
  transfer: async (id: string, asmId: string) =>
    (await apiClient.post<ApiSuccess<unknown>>(`${base(id)}/transfer`, { asmId })).data,

  addAccount: async (id: string, input: PayoutAccountInput) =>
    (await apiClient.post<ApiSuccess<PayoutAccount[]>>(`${base(id)}/payout-accounts`, input)).data,

  editAccount: async (id: string, accountId: string, changes: PayoutAccountChanges) =>
    (await apiClient.patch<ApiSuccess<PayoutAccount[]>>(account(id, accountId), changes)).data,

  setDefaultAccount: async (id: string, accountId: string) =>
    (await apiClient.post<ApiSuccess<PayoutAccount[]>>(`${account(id, accountId)}/set-default`))
      .data,

  removeAccount: async (id: string, accountId: string) =>
    (await apiClient.post<ApiSuccess<PayoutAccount[]>>(`${account(id, accountId)}/remove`)).data,

  // ---- T4: Admin only (`partners.remove_draft`, DEC-096, DEC-097) ----

  /** Who holds this number (old copies included). A read: not audited. */
  numberLookup: async (input: LookupInput) =>
    (
      await apiClient.post<ApiSuccess<{ found: boolean; holders: NumberHolder[] }>>(
        "/partners/number-lookup",
        input,
      )
    ).data,

  /** Retire an unfinished sign-up now: account off, phone and numbers freed, photos deleted. */
  removeDraft: async (id: string, reason: string) =>
    (
      await apiClient.post<ApiSuccess<{ partnerId: string; removed: boolean }>>(
        `${base(id)}/remove-draft`,
        { reason },
      )
    ).data,
};
