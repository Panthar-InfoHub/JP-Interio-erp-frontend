import { apiClient } from "@/lib/api/client";
import { getPage, getPageWithTotals, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type {
  AdjustmentInput,
  LedgerLine,
  LedgerLineWithPartner,
  LedgerTotals,
  LiabilityReport,
  PartnerWalletReply,
  Wallet,
} from "@/types/ledger";
import type { ScanTotals, StaffScanLine } from "@/types/scan";

const partner = (id: string) => `/partners/${encodeURIComponent(id)}`;

/**
 * Points (docs/api/ledger.openapi.yaml, scans.openapi.yaml). `ledger.view`: Admin and
 * the Rewards Sub-Admin all partners, a Zonal Head their zone; out of scope → 404.
 */
export const ledgerApi = {
  /**
   * Lines across partners, newest first, with `totals` for the whole filter. Filters:
   * type (comma list), direction, from / to, zoneId, asmId, partnerId, search, createdById.
   */
  list: (query: ListQuery) =>
    getPageWithTotals<LedgerLineWithPartner, LedgerTotals>("/ledger", query),

  /** The wallet (null + note when not verified) and who the partner is (0.2.1, DEC-256). */
  partnerWallet: async (id: string) =>
    (await apiClient.get<ApiSuccess<PartnerWalletReply>>(`${partner(id)}/wallet`)).data.data,

  /** One partner's statement: type, direction, from / to. No totals. */
  partnerLedger: (id: string, query: ListQuery) =>
    getPage<LedgerLine>(`${partner(id)}/ledger`, query),

  /** `scans.view`. Newest first (`-scannedAt`), with totals; from / to. */
  partnerScans: (id: string, query: ListQuery) =>
    getPageWithTotals<StaffScanLine, ScanTotals>(`${partner(id)}/scans`, query),

  /**
   * `ledger.adjust` (Admin, Rewards Sub-Admin). No double-click protection on the server
   * (DEC-135): lock the button while saving. 400 INSUFFICIENT_POINTS for a debit above
   * available; 409 NO_WALLET / WALLET_FROZEN.
   */
  adjust: async (id: string, input: AdjustmentInput) =>
    (
      await apiClient.post<ApiSuccess<{ line: LedgerLine; wallet: Wallet }>>(
        `${partner(id)}/points-adjustment`,
        input,
      )
    ).data,

  /** `reports.points_liability` (Admin, Rewards Sub-Admin). `asOf` with a time zone; leave out for now. */
  liability: async (asOf?: string) =>
    (
      await apiClient.get<ApiSuccess<LiabilityReport>>("/reports/points-liability", {
        params: asOf ? { asOf } : undefined,
      })
    ).data.data,
};
