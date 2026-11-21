import type { AccountStatus, KycState, Partner360, PartnerType, ZoneRef } from "@/types/partner";

/** The KYC queue tabs (docs/api/kyc.openapi.yaml `state`). */
export type KycQueueState = "pending" | "rejected" | "verified";

interface Ref {
  id: string;
  name: string | null;
}

/** One row of `GET /kyc/queue`. */
export interface KycQueueItem {
  partnerId: string;
  name: string | null;
  phone: string;
  accountStatus: AccountStatus;
  partnerType: PartnerType | null;
  businessName: string | null;
  zone: ZoneRef | null;
  kycState: Exclude<KycState, "not_submitted">;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  asm: Ref | null;
  salesExecutive: Ref | null;
  /** null = the partner signed up themselves. */
  startedBy: (Ref & { role: string | null }) | null;
  /** True for a self sign-up: an ASM must be picked when approving. */
  needsAsmPick: boolean;
}

/**
 * `GET /kyc/{id}` (and the reply of approve / reject / undo): the same details as
 * Partner 360 (without the summary boxes) plus the ASM choices for a self sign-up.
 */
export type KycDetail = Omit<Partner360, "points" | "payouts" | "requests" | "tickets"> & {
  needsAsmPick: boolean;
  /** Active ASMs of the partner's zone; only for a pending self sign-up. */
  asmChoices: { id: string; name: string | null; phone: string }[];
};
