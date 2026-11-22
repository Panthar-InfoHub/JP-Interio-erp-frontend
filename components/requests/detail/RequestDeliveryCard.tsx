import { DetailList, DetailRow } from "@/components/common/DetailList";
import type { RequestDetail } from "@/lib/api/requests.api";
import { formatDate } from "@/lib/format/date";

/** Where and when the partner wants it, their notes, and any reject / cancel reason. */
export function RequestDeliveryCard({ request }: { request: RequestDetail }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Delivery">
      <h2 className="mb-4 text-base">Delivery</h2>
      <DetailList>
        <DetailRow label="Address">
          <span className="whitespace-pre-line">{request.deliveryAddress}</span>
        </DetailRow>
        <DetailRow label="Wanted by">{formatDate(request.preferredDeliveryDate)}</DetailRow>
        <DetailRow label="Partner's notes">{request.notes || "—"}</DetailRow>
        {request.rejectReason ? (
          <DetailRow label="Reject reason">{request.rejectReason}</DetailRow>
        ) : null}
        {request.cancelReason ? (
          <DetailRow label="Cancel reason">{request.cancelReason}</DetailRow>
        ) : null}
      </DetailList>
    </section>
  );
}
