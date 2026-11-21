import { formatDateTime } from "@/lib/format/date";
import type { StaffPayoutDetail } from "@/types/payout";

interface Step {
  key: string;
  label: string;
  at: string;
  by: string | null;
  reason?: string | null;
  tone: "default" | "danger";
}

/**
 * What happened to the payout, oldest first. There is no separate history list: the
 * payout keeps the time and the person of each step (requested → approved → paid, or
 * declined / failed with a reason).
 */
export function PayoutSteps({ payout }: { payout: StaffPayoutDetail }) {
  const steps: Step[] = [
    {
      key: "requested",
      label: "Requested by the partner",
      at: payout.createdAt,
      by: null,
      tone: "default",
    },
  ];
  if (payout.approvedAt) {
    steps.push({
      key: "approved",
      label: "Approved",
      at: payout.approvedAt,
      by: payout.approvedBy?.name ?? null,
      tone: "default",
    });
  }
  if (payout.declinedAt) {
    steps.push({
      key: "declined",
      label: "Declined (points back to the partner)",
      at: payout.declinedAt,
      by: payout.declinedBy?.name ?? null,
      reason: payout.declineReason,
      tone: "danger",
    });
  }
  if (payout.paidAt) {
    steps.push({
      key: "paid",
      label: "Marked paid",
      at: payout.paidAt,
      by: payout.paidBy?.name ?? null,
      tone: "default",
    });
  }
  if (payout.failedAt) {
    steps.push({
      key: "failed",
      label: "Marked failed (points back to the partner)",
      at: payout.failedAt,
      by: payout.failedBy?.name ?? null,
      reason: payout.failureReason,
      tone: "danger",
    });
  }

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Steps">
      <h2 className="mb-4 text-base">Steps</h2>
      <ol className="relative flex flex-col gap-5 border-l pl-5">
        {steps.map((step) => (
          <li key={step.key} className="relative">
            <span
              className={
                step.tone === "danger"
                  ? "absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-destructive ring-4 ring-card"
                  : "absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-card"
              }
              aria-hidden
            />
            <p className="font-semibold">{step.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(step.at)}
              {step.by ? ` · ${step.by}` : ""}
            </p>
            {step.reason ? (
              <p className="mt-1 text-sm text-muted-foreground">“{step.reason}”</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
