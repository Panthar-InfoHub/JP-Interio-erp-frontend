import { CopyButton } from "@/components/common/CopyButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { ScannedByCell } from "@/components/qr-batches/detail/ScannedByCell";
import type { QrBatchCode } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { qrCodeStatus } from "@/lib/labels/qr";

const col = createColumns<QrBatchCode>();

/** A batch's codes (stable, defined once, DEC-276): code + copy link, status, scan. */
export const qrCodeColumns = col.columns([
  col.accessor("code", {
    header: "Code",
    cell: (info) => (
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm font-semibold tracking-wide">{info.getValue()}</span>
        <CopyButton value={info.row.original.link} label="Copy the QR link" />
      </div>
    ),
    meta: { sortField: "code", primary: true },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = qrCodeStatus(info.getValue());
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("scannedAt", {
    header: "Scanned",
    cell: (info) => (
      <span className="whitespace-nowrap">
        {info.getValue() ? formatDateTime(info.getValue()) : "—"}
      </span>
    ),
    meta: { sortField: "scannedAt", firstSort: "desc" },
  }),
  col.accessor("scannedBy", {
    header: "Scanned by",
    cell: (info) => <ScannedByCell partner={info.getValue()} />,
  }),
]);
