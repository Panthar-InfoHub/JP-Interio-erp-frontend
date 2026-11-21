import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { formatDateTime } from "@/lib/format/date";
import { formatPoints, formatRupees } from "@/lib/format/number";
import { formatPhone } from "@/lib/format/phone";
import { PAID_METHOD_LABELS, payoutStatus } from "@/lib/labels/payout";
import type { StaffPayout } from "@/types/payout";

const col = createColumns<StaffPayout>();

/** Payout list columns (stable, defined once). */
export const payoutColumns = col.columns([
  col.accessor("payoutNo", {
    header: "Payout",
    cell: (info) => <span className="font-semibold whitespace-nowrap">{info.getValue()}</span>,
    meta: { primary: true },
  }),
  col.accessor((row) => row.partner.name, {
    id: "partner",
    header: "Partner",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate">{row.partner.name ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{formatPhone(row.partner.phone)}</p>
        </div>
      );
    },
  }),
  col.accessor("amount", {
    header: "Amount",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="text-right whitespace-nowrap">
          <p className="font-semibold">{formatRupees(row.amount)}</p>
          <p className="text-xs text-muted-foreground">{formatPoints(row.points)}</p>
        </div>
      );
    },
    meta: { align: "end" },
  }),
  col.accessor((row) => row.account.method, {
    id: "account",
    header: "Pay to",
    cell: (info) => {
      const row = info.row.original;
      if (row.status === "paid" || row.status === "failed") {
        return row.paidMethod ? `Paid by ${PAID_METHOD_LABELS[row.paidMethod]}` : "—";
      }
      return row.account.method === "bank" ? (row.account.bankName ?? "Bank account") : "UPI";
    },
  }),
  col.accessor((row) => row.zoneAtRequest?.name ?? "—", { id: "zone", header: "Zone" }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = payoutStatus(info.getValue());
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("createdAt", {
    header: "Requested",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc" },
  }),
]);

/** The same for one partner's payouts (Partner 360 tab, DEC-258): no partner column. */
export const partnerPayoutColumns = payoutColumns.filter((column) => column.id !== "partner");
