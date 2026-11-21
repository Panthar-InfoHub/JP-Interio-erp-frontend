/** A partner's scans for staff (docs/api/scans.openapi.yaml `StaffScanLine`; scanHistory.service.ts). */
export interface StaffScanLine {
  id: string;
  scannedAt: string;
  code: string;
  points: number;
  product: { id: string; sku: string; name: string; imageUrl: string | null };
  batch: { id: string; batchNo: string };
  /** Admin and Sub-Admins only. */
  deviceId?: string | null;
  ip?: string | null;
}

/** `meta.totals` of a scan list, for the whole filter. */
export interface ScanTotals {
  scans: number;
  points: number;
}
