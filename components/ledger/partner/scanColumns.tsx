import { createColumns } from "@/components/data-table/columns";
import { formatDateTime } from "@/lib/format/date";
import { formatPoints } from "@/lib/format/number";
import type { StaffScanLine } from "@/types/scan";

const col = createColumns<StaffScanLine>();

/** A partner's scans (stable, defined once). Device / IP only reach Admin and Sub-Admins. */
export const scanColumns = col.columns([
  col.accessor("scannedAt", {
    header: "Scanned",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "scannedAt", firstSort: "desc" },
  }),
  col.accessor((row) => row.product.name, {
    id: "product",
    header: "Product",
    cell: (info) => {
      const { product } = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{product.name}</p>
          <p className="truncate text-xs text-muted-foreground">{product.sku}</p>
        </div>
      );
    },
    meta: { primary: true },
  }),
  col.accessor("code", {
    header: "Code",
    cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  col.accessor((row) => row.batch.batchNo, { id: "batch", header: "Batch" }),
  col.accessor("points", {
    header: "Points",
    cell: (info) => (
      <span className="font-semibold whitespace-nowrap text-success">
        +{formatPoints(info.getValue())}
      </span>
    ),
    meta: { align: "end" },
  }),
  col.accessor((row) => row.deviceId ?? row.ip ?? "", {
    id: "device",
    header: "Device / IP",
    cell: (info) => {
      const row = info.row.original;
      if (row.deviceId === undefined && row.ip === undefined) return "—";
      return (
        <div className="min-w-0 text-xs text-muted-foreground">
          <p className="truncate">{row.deviceId ?? "—"}</p>
          <p className="truncate">{row.ip ?? "—"}</p>
        </div>
      );
    },
    meta: { hideOnMobile: true },
  }),
]);
