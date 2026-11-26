import { StatusBadge } from "@/components/common/StatusBadge";
import { ticketStatus } from "@/lib/labels/ticket";

/** A ticket's status badge (DEC-295). */
export function TicketStatusBadge({ status }: { status: string }) {
  const { label, tone } = ticketStatus(status);
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}
