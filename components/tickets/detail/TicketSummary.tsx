import { TicketActions } from "@/components/tickets/detail/TicketActions";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import type { Ticket } from "@/lib/api/tickets.api";
import { formatDateTime } from "@/lib/format/date";

/** The ticket's head (DEC-296): number, status, category, raised time and the Admin's moves. */
export function TicketSummary({ ticket }: { ticket: Ticket }) {
  return (
    <section
      aria-label="Ticket"
      className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl">{ticket.ticketNo}</h1>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {ticket.categoryLabel} · raised {formatDateTime(ticket.createdAt)}
        </p>
      </div>
      <TicketActions ticket={ticket} />
    </section>
  );
}
