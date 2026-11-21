import { formatDateTime } from "@/lib/format/date";
import { REVIEW_ACTION_LABELS } from "@/lib/labels/partner";
import type { Partner360 } from "@/types/partner";

/** The KYC review history, oldest first (submitted, approved, rejected, undone). */
export function PartnerHistoryTab({ partner }: { partner: Partner360 }) {
  if (partner.history.length === 0) {
    return <p className="text-sm text-muted-foreground">No KYC review steps yet.</p>;
  }

  return (
    <ol className="relative flex flex-col gap-5 border-l pl-5">
      {partner.history.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-background"
            aria-hidden
          />
          <p className="font-semibold">{REVIEW_ACTION_LABELS[entry.action] ?? entry.action}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(entry.at)} · {entry.by.name ?? "—"}
            {entry.by.role ? ` (${entry.by.role})` : ""}
          </p>
          {entry.assignedAsm ? (
            <p className="mt-1 text-sm">ASM assigned: {entry.assignedAsm.name}</p>
          ) : null}
          {entry.reason ? (
            <p className="mt-1 text-sm text-muted-foreground">“{entry.reason}”</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
