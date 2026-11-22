import type { RequestTimelineEntry } from "@/lib/api/requests.api";
import { formatDateTime } from "@/lib/format/date";
import { requestStage } from "@/lib/labels/request";
import { cn } from "@/lib/utils";

const RED = new Set(["rejected", "cancelled"]);

function describe(entry: RequestTimelineEntry): string {
  if (entry.type === "created") return "Sent by the partner";
  if (entry.type === "handler_change") {
    const from = entry.fromHandler?.name ?? "someone";
    const to = entry.toHandler?.name ?? "someone";
    return `Handed from ${from} to ${to}`;
  }
  return entry.toStatus ? requestStage(entry.toStatus).label : "Stage changed";
}

/**
 * Everything that happened to the request, oldest first (DEC-166, DEC-282): sent, each
 * stage move with who and when, the reject / cancel reason, and the ASM's hand-overs with
 * their reason. Rejected / cancelled lines have a red dot.
 */
export function RequestTimeline({ timeline }: { timeline: RequestTimelineEntry[] }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Timeline">
      <h2 className="mb-4 text-base">Timeline</h2>
      {timeline.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
      ) : (
        <ol className="relative flex flex-col gap-5 border-l pl-5">
          {timeline.map((entry, index) => {
            const red = entry.type === "status_change" && RED.has(entry.toStatus ?? "");
            return (
              <li key={`${entry.createdAt}-${index}`} className="relative">
                <span
                  className={cn(
                    "absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full ring-4 ring-card",
                    red ? "bg-destructive" : "bg-primary",
                  )}
                  aria-hidden
                />
                <p className="font-semibold">{describe(entry)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                  {entry.actor?.name ? ` · ${entry.actor.name}` : ""}
                </p>
                {entry.reason ? (
                  <p className="mt-1 text-sm wrap-break-word text-muted-foreground">
                    “{entry.reason}”
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
