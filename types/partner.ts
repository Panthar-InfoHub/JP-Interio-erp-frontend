/**
 * Partners (docs/api/partners.openapi.yaml, kyc.openapi.yaml). Written out from the
 * backend's real replies (partner.service.ts, partnerDetail.service.ts,
 * onboarding.service.ts): the API file describes Partner 360 only in words.
 */

export type PartnerType = "carpenter" | "dealer" | "oem";
export type KycState = "not_submitted" | "pending" | "verified" | "rejected";
export type AccountStatus = "active" | "suspended" | "deactivated";

interface Ref {
  id: string;
  name: string | null;
}
interface PersonRef extends Ref {
  phone: string;
}
export interface ZoneRef {
  id: string;
  name: string;
  code: string;
}

/** One row of `GET /partners` (verified partners only). */
export interface PartnerListItem {
  id: string;
  name: string | null;
  phone: string;
  status: AccountStatus;
  partnerType: PartnerType | null;
  businessName: string | null;
  kycState: KycState;
  zone: ZoneRef | null;
  asm: Ref | null;
  salesExecutive: Ref | null;
  joinedAt: string;
  verifiedAt: string | null;
}

/** A stored document: full number + file link (shown masked on screen, DEC-240). */
export interface KycDocument {
  number: string;
  fileUrl: string;
}

export interface PayoutAccount {
  id: string;
  method: "bank" | "upi";
  holderName: string;
  /** Bank only. */
  accountNumber?: string;
  ifsc?: string | null;
  /** UPI only. */
  upiId?: string;
  bankName: string | null;
  isDefault: boolean;
}

/** Add a bank account or UPI ID (same body as the onboarding payout step). */
export type PayoutAccountInput =
  | {
      method: "bank";
      holderName: string;
      accountNumber: string;
      ifsc: string;
      bankName?: string | null;
    }
  | { method: "upi"; upiId: string; holderName?: string | null };

/** Edit an account: send only what changes (bank or UPI fields, never both). */
export interface PayoutAccountChanges {
  holderName?: string | null;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string | null;
  upiId?: string;
}

/** Edit a verified partner's details: send only what changes ("" clears an optional field). */
export interface PartnerProfileChanges {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  businessName?: string;
  /** Dealer / OEM only. "YYYY-MM-DD" or "" to clear. */
  ownerDob?: string;
  ownerAnniversaryDate?: string;
  ownerSpouseName?: string;
}

/** Number lookup (Admin, DEC-096): what kind of number. A bank account also needs its IFSC. */
export type LookupType = "pan" | "aadhaar" | "gst" | "bank_account" | "upi";

export type LookupInput =
  | { type: Exclude<LookupType, "bank_account">; number: string }
  | { type: "bank_account"; number: string; ifsc: string };

/** One partner holding a looked-up number (backend numberLookup.service.ts). */
export interface NumberHolder {
  partnerId: string;
  name: string | null;
  phone: string;
  partnerType: PartnerType | null;
  businessName: string | null;
  zone: { id: string; name: string } | null;
  accountStatus: AccountStatus;
  /** The raw KYC state (`verified`, not `approved` as the API file says, DEC-247). */
  kycState: KycState;
  onboardingStep: string;
  startedAt: string | null;
  submittedAt: string | null;
  /** null = the partner signed up on their own. */
  startedBy: { id: string; name: string | null; role: string | null } | null;
  /** `replaced_or_removed` = an old copy, which still blocks the number. */
  numberStatus: "in_use" | "replaced_or_removed";
  /** True only for an unfinished draft: the Admin may remove it now. */
  canRemoveDraft: boolean;
}

export type ReviewAction = "submitted" | "approved" | "rejected" | "rejection_undone";

export interface ReviewHistoryEntry {
  id: string;
  action: ReviewAction;
  reason: string | null;
  at: string;
  by: { id: string; name: string | null; role: string | null };
  assignedAsm: Ref | null;
}

export interface PointsBox {
  wallet: {
    available: number;
    availableRupees: string;
    held: number;
    heldRupees: string;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
    lifetimeRedeemedRupees: string;
    netAdjusted: number;
    scanCount: number;
    frozen: boolean;
    updatedAt: string;
  } | null;
  note: string | null;
}

export interface PayoutsBox {
  open: { count: number; points: number; rupees: string };
  paidOut: { count: number; points: number; rupees: string };
  latest: {
    id: string;
    payoutNo: string;
    status: string;
    points: number;
    createdAt: string;
  } | null;
}

export interface RequestsBox {
  open: number;
  total: number;
  latest: {
    id: string;
    requestNo: string;
    category: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface TicketsBox {
  open: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  total: number;
}

/** `GET /partners/{id}`: a partner in any state. Boxes appear only for roles allowed to see them. */
export interface Partner360 {
  partnerId: string;
  accountStatus: AccountStatus;
  joinedAt: string;
  reviewedAt: string | null;
  asm: PersonRef | null;
  salesExecutive: PersonRef | null;
  /** Who started the sign-up; null = the partner signed up themselves. */
  startedBy: (PersonRef & { role: string | null }) | null;
  kycState: KycState;
  nextStep: string;
  steps: string[];
  setUpBy: { name: string | null; phone: string } | null;
  basicInfo: {
    name: string | null;
    email: string | null;
    phone: string;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    zone: ZoneRef | null;
    partnerType: PartnerType | null;
    businessName: string | null;
  } | null;
  /** Dealer / OEM only. */
  firmDetails: {
    firmName: string | null;
    gstNumber: string;
    gstCertificateUrl: string;
    ownerDob: string | null;
    ownerAnniversaryDate: string | null;
    ownerSpouseName: string | null;
  } | null;
  payoutAccounts: PayoutAccount[];
  kycDocuments: { pan: KycDocument | null; aadhaar: KycDocument | null };
  submittedAt: string | null;
  rejectionReason: string | null;
  history: ReviewHistoryEntry[];
  points?: PointsBox;
  payouts?: PayoutsBox;
  requests?: RequestsBox;
  tickets?: TicketsBox;
}
