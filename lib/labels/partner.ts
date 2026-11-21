import type { StatusTone } from "@/components/common/StatusBadge";
import type { AccountStatus, KycState, PartnerType, ReviewAction } from "@/types/partner";

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  carpenter: "Carpenter",
  dealer: "Dealer",
  oem: "OEM",
};

export const KYC_STATE: Record<KycState, { label: string; tone: StatusTone }> = {
  not_submitted: { label: "Sign-up not finished", tone: "neutral" },
  pending: { label: "KYC pending", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const ACCOUNT_STATUS: Record<AccountStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  deactivated: { label: "Deactivated", tone: "neutral" },
};

export const REVIEW_ACTION_LABELS: Record<ReviewAction, string> = {
  submitted: "Submitted for KYC",
  approved: "KYC approved",
  rejected: "KYC rejected",
  rejection_undone: "Rejection undone (back to the queue)",
};

export function partnerTypeLabel(type: PartnerType | null | undefined): string {
  return type ? PARTNER_TYPE_LABELS[type] : "—";
}
