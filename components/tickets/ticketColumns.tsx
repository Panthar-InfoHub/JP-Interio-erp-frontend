import { createColumns } from "@/components/data-table/columns";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import type { TicketRow } from "@/lib/api/tickets.api";
import { formatDateTime } from "@/lib/format/date";
import { formatCount } from "@/lib/format/number";
import { formatPhone } from "@/lib/format/phone";

const col = createColumns<TicketRow>();

/**
 * Ticket queue columns (stable, defined once, DEC-295). Only "Ticket" sorts (the queue sorts
 * by when it was raised). The partner's name is plain here; the ticket page links to
 * Partner 360.
 */
export const ticketColumns = col.columns([
  col.accessor("ticketNo", {
    header: "Ticket",
    cell: (info) => (
      <div className="whitespace-nowrap">
        <p className="font-semibold">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(info.row.original.createdAt)}
        </p>
      </div>
    ),
    meta: { sortField: "createdAt", firstSort: "desc", primary: true },
  }),
  col.accessor((row) => row.partner.name, {
    id: "partner",
    header: "Partner",
    cell: (info) => {
      const partner = info.row.original.partner;
      return (
        <div className="min-w-0">
          <p className="truncate">{partner.name ?? "Sign-up not finished"}</p>
          <p className="text-xs text-muted-foreground">{formatPhone(partner.phone)}</p>
        </div>
      );
    },
  }),
  col.accessor("categoryLabel", {
    header: "Category",
    cell: (info) => <span className="wrap-break-word">{info.getValue()}</span>,
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <TicketStatusBadge status={info.getValue()} />,
  }),
  col.accessor("photoCount", {
    header: "Photos",
    cell: (info) => (
      <span className="tabular-nums">{info.getValue() ? formatCount(info.getValue()) : "—"}</span>
    ),
    meta: { align: "end" },
  }),
  col.accessor("statusChangedAt", {
    header: "Last change",
    cell: (info) => {
      const changedAt = info.getValue();
      if (!changedAt) return <span className="text-muted-foreground">Not handled yet</span>;
      return (
        <div className="whitespace-nowrap">
          <p>{formatDateTime(changedAt)}</p>
          <p className="text-xs text-muted-foreground">
            {info.row.original.updatedBy?.name ?? "Admin"}
          </p>
        </div>
      );
    },
    meta: { hideOnMobile: true },
  }),
]);

/** One partner's tickets (Partner 360 Tickets tab, DEC-297): the same without Partner. */
export const partnerTicketColumns = ticketColumns.filter((column) => column.id !== "partner");
