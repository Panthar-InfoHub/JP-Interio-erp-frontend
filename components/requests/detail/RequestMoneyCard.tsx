import { DetailList, DetailRow } from "@/components/common/DetailList";
import { DocumentPreview } from "@/components/common/DocumentPreview";
import type { RequestMoney } from "@/lib/api/requests.api";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { formatRupees } from "@/lib/format/number";
import { PAY_MODE_LABELS } from "@/lib/labels/request";

/**
 * Money received (Payment) or returned (Refund), as the handler recorded it (DEC-160,
 * DEC-170): date, mode, reference, receipt (thumbnail + big preview, DEC-282), who and
 * when. A refund is always the full agreed amount. Not shown when there is none.
 */
export function RequestMoneyCard({
  title,
  money,
  amount,
}: {
  title: "Payment" | "Refund";
  money: RequestMoney;
  /** The agreed amount (what was paid, and what a refund returns). */
  amount: string | null;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label={title}>
      <h2 className="mb-4 text-base">{title}</h2>
      <DetailList>
        <DetailRow label="Amount">{amount ? formatRupees(amount) : "—"}</DetailRow>
        <DetailRow label={title === "Payment" ? "Received on" : "Returned on"}>
          {formatDate(money.date)}
        </DetailRow>
        <DetailRow label="Mode">{PAY_MODE_LABELS[money.mode] ?? money.mode}</DetailRow>
        <DetailRow label="Reference">{money.reference || "—"}</DetailRow>
        <DetailRow label="Receipt">
          {money.receiptUrl ? (
            <DocumentPreview url={money.receiptUrl} title={`${title} receipt`} />
          ) : (
            <span className="text-muted-foreground">None added</span>
          )}
        </DetailRow>
        <DetailRow label="Recorded">
          {formatDateTime(money.recordedAt)}
          {money.recordedBy?.name ? ` · ${money.recordedBy.name}` : ""}
        </DetailRow>
      </DetailList>
    </section>
  );
}
