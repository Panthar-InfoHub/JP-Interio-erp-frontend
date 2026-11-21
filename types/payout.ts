/**
 * Payouts (docs/api/payouts.openapi.yaml), checked against the backend's real replies
 * (payout.service.ts `toStaffPayout`, `getPayoutForStaff`).
 */
import type { PointsBox } from "@/types/partner";

export type PayoutStatus = "requested" | "approved" | "paid" | "declined" | "failed";
export type PaidMethod = "cash" | "upi" | "bank_transfer";

interface Ref {
  id: string;
  name: string | null;
}

/** The partner's account, copied when they asked (full number, DEC-149, DEC-151). */
export interface PayoutAccountCopy {
  method: "upi" | "bank";
  holderName: string | null;
  /** UPI only. */
  upiId?: string;
  /** Bank only. */
  accountNumber?: string;
  ifsc?: string | null;
  bankName: string | null;
}

/** One row of `GET /payouts` (and the reply of every payout step). */
export interface StaffPayout {
  id: string;
  payoutNo: string;
  points: number;
  /** Rupees as text, e.g. "500.00". */
  amount: string;
  status: PayoutStatus;
  /** The partner's own note. */
  note: string | null;
  account: PayoutAccountCopy;
  approvedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  paidAt: string | null;
  paidMethod: PaidMethod | null;
  transactionId: string | null;
  failedAt: string | null;
  failureReason: string | null;
  /** When the partner asked. */
  createdAt: string;
  updatedAt: string;
  /** Staff only. */
  proofUrl: string | null;
  partner: { id: string; name: string | null; phone: string };
  /** The partner's zone and ASM when they asked (for reports, DEC-150). */
  zoneAtRequest: Ref | null;
  owningAsmAtRequest: Ref | null;
  approvedBy: Ref | null;
  declinedBy: Ref | null;
  paidBy: Ref | null;
  failedBy: Ref | null;
}

/** The reply of every payout step. `alreadyDone` = pressed again; nothing changed. */
export interface PayoutStepResult {
  alreadyDone: boolean;
  payout: StaffPayout;
}

/** `POST /payouts/{id}/mark-paid`: a transaction ID unless cash; proof optional. */
export interface MarkPaidInput {
  method: PaidMethod;
  transactionId?: string;
  proofUrl?: string;
}

/** `PATCH /payouts/{id}/paid-details`: only what changes; `null` clears. */
export interface PaidDetailsChanges {
  method?: PaidMethod;
  transactionId?: string | null;
  proofUrl?: string | null;
}

/** `GET /payouts/{id}`: the payout plus facts about the partner to help decide (DEC-156). */
export interface StaffPayoutDetail extends StaffPayout {
  partnerContext: {
    /** The wallet now (same shape as the Partner 360 points box). */
    wallet: PointsBox["wallet"];
    walletNote: string | null;
    recentScans: { days: number; scans: number; points: number };
    /** The partner's last 5 other payouts, newest first. */
    recentPayouts: {
      id: string;
      payoutNo: string;
      points: number;
      status: PayoutStatus;
      createdAt: string;
    }[];
    /** When KYC was approved (latest approval). */
    verifiedAt: string | null;
  };
}
