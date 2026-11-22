import { Ban } from "lucide-react";

import { DetailList, DetailRow } from "@/components/common/DetailList";
import type { QrBatchDetail } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground tabular-nums">{sub}</p> : null}
    </div>
  );
}

/** The batch's numbers, its facts and, when voided, who voided it and why. */
export function QrBatchSummary({ batch }: { batch: QrBatchDetail }) {
  const { active, scanned } = batch.codeCounts;

  return (
    <>
      {batch.status === "voided" ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold text-destructive">
              Voided
              {batch.voidedAt ? ` on ${formatDateTime(batch.voidedAt)}` : ""}
              {batch.voidedBy ? ` by ${batch.voidedBy.name}` : ""}
            </p>
            {batch.voidReason ? (
              <p className="mt-1 wrap-break-word">&ldquo;{batch.voidReason}&rdquo;</p>
            ) : null}
            <p className="mt-1 text-muted-foreground">
              Its unused codes can never be scanned; scanned codes kept their points. It can&apos;t
              be downloaded any more.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Codes" value={formatCount(batch.quantity)} />
        <Stat label="Points per code" value={formatPoints(batch.pointsPerCode)} />
        <Stat
          label="Total if all scanned"
          value={formatPoints(batch.totalPoints)}
          sub={formatRupees(batch.totalPoints)}
        />
        <Stat
          label="Scanned"
          value={formatCount(scanned)}
          sub={`${formatCount(active)} unused${batch.codeCounts.void > 0 ? ` · ${formatCount(batch.codeCounts.void)} void` : ""}`}
        />
      </div>

      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Details">
        <h2 className="mb-4 text-base">Details</h2>
        <DetailList>
          <DetailRow label="Product">
            {batch.product.name} ({batch.product.sku})
          </DetailRow>
          <DetailRow label="Made">
            {formatDateTime(batch.createdAt)} · {batch.createdBy.name}
          </DetailRow>
          <DetailRow label="First downloaded">
            {batch.firstExportedAt ? formatDateTime(batch.firstExportedAt) : "Not yet"}
          </DetailRow>
          <DetailRow label="Notes">{batch.notes || "—"}</DetailRow>
        </DetailList>
      </section>
    </>
  );
}
