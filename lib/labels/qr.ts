import type { StatusTone } from "@/components/common/StatusBadge";
import type { QrBatchStatus, QrCodeStatus } from "@/lib/api/qr.api";

/** A code's status (DEC-276): unused, scanned, or void (its batch was voided while unused). */
export const QR_CODE_STATUS: Record<QrCodeStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Unused", tone: "neutral" },
  scanned: { label: "Scanned", tone: "success" },
  void: { label: "Void", tone: "danger" },
};

export function qrCodeStatus(status: string): { label: string; tone: StatusTone } {
  return QR_CODE_STATUS[status as QrCodeStatus] ?? { label: status, tone: "neutral" };
}

/** Plain words for a batch's status (DEC-275). */
export const QR_BATCH_STATUS: Record<QrBatchStatus, { label: string; tone: StatusTone }> = {
  generated: { label: "Not downloaded", tone: "warning" },
  exported: { label: "Downloaded", tone: "success" },
  voided: { label: "Voided", tone: "danger" },
};

/** A status from the API that this screen may not know yet still shows as text. */
export function qrBatchStatus(status: string): { label: string; tone: StatusTone } {
  return QR_BATCH_STATUS[status as QrBatchStatus] ?? { label: status, tone: "neutral" };
}
