/**
 * Points ledger, wallets and liability (docs/api/ledger.openapi.yaml), checked against
 * the backend's real replies (wallet.service.ts `toLine`, `listLedger`,
 * `getPartnerWallet`; report.service.ts `getPointsLiability`).
 */
import type { PointsBox, ZoneRef } from "@/types/partner";

export type LineType = "earn" | "hold" | "release" | "redeem" | "refund" | "adjust";
export type LineDirection = "credit" | "debit";

export type Wallet = NonNullable<PointsBox["wallet"]>;

/** The partner on an across-partners line (and in the wallet reply, 0.2.1). */
export interface LinePartner {
  id: string;
  name: string | null;
  phone: string;
  businessName: string | null;
  zone: ZoneRef | null;
}

/** One ledger line (statement row). */
export interface LedgerLine {
  id: string;
  type: LineType;
  /** Short English text from the server, e.g. "Points added by JP Interio". */
  label: string;
  direction: LineDirection;
  /** Always above 0. */
  points: number;
  /** Signed changes, for colouring. */
  availableChange: number;
  heldChange: number;
  availableAfter: number;
  heldAfter: number;
  reason: string | null;
  /** null = the system (scan, automatic refund). Staff see the real name (DEC-134). */
  by: { id?: string; name: string | null } | null;
  scan: { code: string; productName: string } | null;
  payoutId: string | null;
  createdAt: string;
}

/** A line of `GET /ledger` (across partners). */
export interface LedgerLineWithPartner extends LedgerLine {
  partner: LinePartner;
}

/** `meta.totals` of `GET /ledger`, for the whole filter. `adjust` points are the net. */
export interface LedgerTotals {
  lines: number;
  pointsIn: number;
  pointsOut: number;
  byType: Partial<Record<LineType, { lines: number; points: number }>>;
}

/** `GET /partners/{id}/wallet`. */
export interface PartnerWalletReply {
  partnerId: string;
  partner: LinePartner;
  /** null = not verified yet (no wallet), with a note. */
  wallet: Wallet | null;
  note: string | null;
}

/** `POST /partners/{id}/points-adjustment`. */
export interface AdjustmentInput {
  direction: LineDirection;
  points: number;
  /** 10 – 500 characters, shown to the partner. */
  reason: string;
}

export interface LiabilityAmounts {
  /** Partners owed more than 0. */
  partnersWithPoints: number;
  available: number;
  held: number;
  /** available + held. */
  owed: number;
  owedRupees: string;
  /** Of which frozen. */
  frozen: number;
  frozenRupees: string;
}

/** `GET /reports/points-liability`. */
export interface LiabilityReport {
  asOf: string;
  note: string;
  total: LiabilityAmounts;
  /** Active zones (even with 0), inactive zones that still owe, and `zone: null` = no zone. */
  zones: (LiabilityAmounts & {
    zone: (ZoneRef & { status: "active" | "inactive" }) | null;
  })[];
}
