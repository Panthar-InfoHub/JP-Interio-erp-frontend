import { createColumns } from "@/components/data-table/columns";
import { LineDescription, lineMaker, PointsChange } from "@/components/ledger/PointsChange";
import { formatDateTime } from "@/lib/format/date";
import { formatPoints } from "@/lib/format/number";
import { formatPhone } from "@/lib/format/phone";
import type { LedgerLine, LedgerLineWithPartner } from "@/types/ledger";

const all = createColumns<LedgerLineWithPartner>();
const one = createColumns<LedgerLine>();

/** Points ledger across partners (stable, defined once). A row opens the partner points page. */
export const ledgerColumns = all.columns([
  all.accessor("createdAt", {
    header: "When",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc" },
  }),
  all.accessor((row) => row.partner.name, {
    id: "partner",
    header: "Partner",
    cell: (info) => {
      const { partner } = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{partner.name ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatPhone(partner.phone)}
            {partner.zone ? ` · ${partner.zone.name}` : ""}
          </p>
        </div>
      );
    },
    meta: { primary: true },
  }),
  all.accessor("label", {
    header: "What",
    cell: (info) => <LineDescription line={info.row.original} />,
  }),
  all.accessor("availableChange", {
    header: "Points",
    cell: (info) => <PointsChange line={info.row.original} />,
    meta: { align: "end" },
  }),
  all.accessor("availableAfter", {
    header: "Available after",
    cell: (info) => <span className="whitespace-nowrap">{formatPoints(info.getValue())}</span>,
    meta: { align: "end" },
  }),
  all.accessor((row) => lineMaker(row), { id: "by", header: "Made by" }),
]);

/** One partner's statement: the same without the partner column. */
export const statementColumns = one.columns([
  one.accessor("createdAt", {
    header: "When",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc" },
  }),
  one.accessor("label", {
    header: "What",
    cell: (info) => <LineDescription line={info.row.original} />,
    meta: { primary: true },
  }),
  one.accessor("availableChange", {
    header: "Points",
    cell: (info) => <PointsChange line={info.row.original} />,
    meta: { align: "end" },
  }),
  one.accessor("availableAfter", {
    header: "Available after",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="text-right whitespace-nowrap">
          <p>{formatPoints(row.availableAfter)}</p>
          {row.heldAfter > 0 ? (
            <p className="text-xs text-muted-foreground">{formatPoints(row.heldAfter)} held</p>
          ) : null}
        </div>
      );
    },
    meta: { align: "end" },
  }),
  one.accessor((row) => lineMaker(row), { id: "by", header: "Made by" }),
]);
