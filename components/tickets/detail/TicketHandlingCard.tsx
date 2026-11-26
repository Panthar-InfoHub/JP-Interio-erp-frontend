import { DetailList, DetailRow } from "@/components/common/DetailList";
import type { Ticket } from "@/lib/api/tickets.api";
import { formatDateTime } from "@/lib/format/date";

/**
 * How it was handled (DEC-296): the last change (time + Admin) and, once resolved or
 * rejected, the note the partner sees and when it was closed. The API keeps only the last
 * change, so earlier moves (e.g. "in progress") aren't listed.
 */
export function TicketHandlingCard({ ticket }: { ticket: Ticket }) {
  const closed = ticket.status === "resolved" || ticket.status === "rejected";

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Handling">
      <h2 className="mb-4 text-base">Handling</h2>
      <DetailList>
        <DetailRow label="Raised">{formatDateTime(ticket.createdAt)}</DetailRow>
        <DetailRow label="Last change">
          {ticket.statusChangedAt ? (
            <>
              {formatDateTime(ticket.statusChangedAt)}
              <span className="text-muted-foreground"> · {ticket.updatedBy?.name ?? "Admin"}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Not handled yet</span>
          )}
        </DetailRow>
        {closed ? (
          <>
            <DetailRow label={ticket.status === "resolved" ? "Resolved" : "Rejected"}>
              {formatDateTime(ticket.closedAt)}
            </DetailRow>
            <DetailRow label="Note for the partner">
              <span className="whitespace-pre-line">{ticket.resolutionNote ?? "—"}</span>
            </DetailRow>
          </>
        ) : null}
      </DetailList>
      <p className="mt-4 text-xs text-muted-foreground">
        Only the latest change is kept, so earlier steps aren&apos;t listed.
      </p>
    </section>
  );
}
