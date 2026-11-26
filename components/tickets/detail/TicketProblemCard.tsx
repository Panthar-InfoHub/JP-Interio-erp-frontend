import { DocumentPreview } from "@/components/common/DocumentPreview";
import type { Ticket } from "@/lib/api/tickets.api";
import { formatCount } from "@/lib/format/number";

/** What the partner wrote and their photos (0 – 5), thumbnails that open large (DEC-296). */
export function TicketProblemCard({ ticket }: { ticket: Ticket }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Problem">
      <h2 className="mb-3 text-base">Problem</h2>
      <p className="text-sm wrap-break-word whitespace-pre-line">{ticket.description}</p>
      <h3 className="mt-5 mb-3 text-sm font-semibold">
        Photos ({formatCount(ticket.photoUrls.length)})
      </h3>
      {ticket.photoUrls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ticket.photoUrls.map((url, index) => (
            <li key={url}>
              <DocumentPreview
                url={url}
                title={`Photo ${index + 1}`}
                thumbClassName="aspect-square w-full"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
