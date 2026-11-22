import { StatusBadge } from "@/components/common/StatusBadge";
import { requestStage } from "@/lib/labels/request";

/** A request's stage, plus "Refund due" for one cancelled after payment (DEC-281). */
export function RequestStageBadge({ status, refundDue }: { status: string; refundDue: boolean }) {
  const stage = requestStage(status);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <StatusBadge tone={stage.tone}>{stage.label}</StatusBadge>
      {refundDue ? <StatusBadge tone="warning">Refund due</StatusBadge> : null}
    </div>
  );
}
