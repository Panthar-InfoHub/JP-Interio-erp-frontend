import Link from "next/link";

import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/format/date";
import { formatPoints, formatRupees } from "@/lib/format/number";
import { formatPhone } from "@/lib/format/phone";
import { payoutStatus } from "@/lib/labels/payout";
import type { StaffPayoutDetail } from "@/types/payout";

/**
 * The payout's head: number, status, amount and who asked. The partner's name opens
 * `partnerHref`: Partner 360 for staff who can see it, otherwise the partner points
 * page (the Rewards Sub-Admin, DEC-256); plain text when neither is allowed.
 */
export function PayoutSummary({
  payout,
  partnerHref,
}: {
  payout: StaffPayoutDetail;
  partnerHref: string | null;
}) {
  const status = payoutStatus(payout.status);
  const partnerName = payout.partner.name ?? "Unnamed partner";

  return (
    <section
      aria-label="Payout"
      className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl">{payout.payoutNo}</h1>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Requested {formatDateTime(payout.createdAt)}
        </p>
        <div className="mt-3 text-sm">
          {partnerHref ? (
            <Link href={partnerHref} className="font-semibold text-primary hover:underline">
              {partnerName}
            </Link>
          ) : (
            <span className="font-semibold">{partnerName}</span>
          )}
          <span className="text-muted-foreground"> · {formatPhone(payout.partner.phone)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          When asked: {payout.zoneAtRequest?.name ?? "no zone"} · ASM{" "}
          {payout.owningAsmAtRequest?.name ?? "—"}
        </p>
        {payout.note ? (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Partner&apos;s note: </span>
            {payout.note}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 sm:text-right">
        <p className="text-2xl font-semibold">{formatRupees(payout.amount)}</p>
        <p className="text-sm text-muted-foreground">{formatPoints(payout.points)}</p>
      </div>
    </section>
  );
}
