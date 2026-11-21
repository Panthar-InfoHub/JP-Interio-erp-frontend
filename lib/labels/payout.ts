import type { StatusTone } from "@/components/common/StatusBadge";
import type { PaidMethod, PayoutStatus } from "@/types/payout";

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; tone: StatusTone }> = {
  requested: { label: "Requested", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
};

export const PAID_METHOD_LABELS: Record<PaidMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank transfer",
};

/** A status from the API that this screen may not know yet still shows as text. */
export function payoutStatus(status: string): { label: string; tone: StatusTone } {
  return PAYOUT_STATUS[status as PayoutStatus] ?? { label: status, tone: "neutral" };
}
