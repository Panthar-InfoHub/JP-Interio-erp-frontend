import type { StatusTone } from "@/components/common/StatusBadge";
import type { PayMode, RequestCategory, RequestStatus } from "@/lib/api/requests.api";

/** How the money was received or returned (DEC-282). */
export const PAY_MODE_LABELS: Record<PayMode, string> = {
  cash: "Cash",
  upi: "UPI",
  cheque: "Cheque",
  bank: "Bank transfer",
};

/** A request's stage: words and colours (DEC-281). */
export const REQUEST_STAGE: Record<RequestStatus, { label: string; tone: StatusTone }> = {
  requested: { label: "Requested", tone: "warning" },
  accepted: { label: "Accepted", tone: "info" },
  payment_received: { label: "Payment received", tone: "info" },
  processing: { label: "Processing", tone: "info" },
  dispatched: { label: "Dispatched", tone: "info" },
  delivered: { label: "Delivered", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  refund_initiated: { label: "Refund initiated", tone: "warning" },
  refunded: { label: "Refunded", tone: "neutral" },
};

/** A stage from the API that this screen may not know yet still shows as text. */
export function requestStage(status: string): { label: string; tone: StatusTone } {
  return REQUEST_STAGE[status as RequestStatus] ?? { label: status, tone: "neutral" };
}

/**
 * Stages that can be "open" or "finished" (DEC-165, DEC-172). "Cancelled" is in both:
 * open while a paid one waits for its refund, finished otherwise.
 */
export const OPEN_STAGES: readonly RequestStatus[] = [
  "requested",
  "accepted",
  "payment_received",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
  "refund_initiated",
];
export const FINISHED_STAGES: readonly RequestStatus[] = [
  "completed",
  "rejected",
  "cancelled",
  "refunded",
];

export const REQUEST_KIND_LABELS: Record<RequestCategory, string> = {
  shipment: "Shipment",
  sample: "Sample",
};

export const HANDLER_ROLE_LABELS: Record<"asm" | "sales_executive", string> = {
  asm: "ASM",
  sales_executive: "Sales Executive",
};
