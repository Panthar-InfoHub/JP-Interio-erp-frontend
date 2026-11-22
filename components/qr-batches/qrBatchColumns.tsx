import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { BatchProductLink } from "@/components/qr-batches/BatchProductLink";
import type { QrBatch } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { formatCount, formatPoints } from "@/lib/format/number";
import { qrBatchStatus } from "@/lib/labels/qr";

const col = createColumns<QrBatch>();

/** QR batch list columns (stable, defined once, DEC-275). A row opens the batch's page. */
export const qrBatchColumns = col.columns([
  col.accessor("batchNo", {
    header: "Batch",
    cell: (info) => <span className="font-semibold whitespace-nowrap">{info.getValue()}</span>,
    meta: { sortField: "batchNo", firstSort: "desc", primary: true },
  }),
  col.accessor((row) => row.product.name, {
    id: "product",
    header: "Product",
    cell: (info) => <BatchProductLink product={info.row.original.product} />,
  }),
  col.accessor("quantity", {
    header: "Codes",
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
    meta: { sortField: "quantity", firstSort: "desc", align: "end" },
  }),
  col.accessor("pointsPerCode", {
    header: "Points per code",
    cell: (info) => (
      <span className="whitespace-nowrap tabular-nums">{formatPoints(info.getValue())}</span>
    ),
    meta: { align: "end" },
  }),
  col.accessor("totalPoints", {
    header: "Total points",
    cell: (info) => (
      <span className="whitespace-nowrap tabular-nums">{formatPoints(info.getValue())}</span>
    ),
    meta: { align: "end" },
  }),
  col.accessor("codeCounts", {
    header: "Used",
    cell: (info) => {
      const counts = info.getValue();
      return (
        <div className="text-xs whitespace-nowrap tabular-nums">
          <p>
            <span className="font-semibold">{formatCount(counts.scanned)}</span> scanned
          </p>
          <p className="text-muted-foreground">{formatCount(counts.active)} unused</p>
          {counts.void > 0 ? (
            <p className="text-muted-foreground">{formatCount(counts.void)} void</p>
          ) : null}
        </div>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = qrBatchStatus(info.getValue());
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("downloadCount", {
    header: "Downloads",
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
    meta: { align: "end", hideOnMobile: true },
  }),
  col.accessor("createdAt", {
    header: "Made",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="whitespace-nowrap">
          <p>{formatDateTime(row.createdAt)}</p>
          <p className="text-xs text-muted-foreground">by {row.createdBy.name}</p>
        </div>
      );
    },
    meta: { sortField: "createdAt", firstSort: "desc" },
  }),
]);
