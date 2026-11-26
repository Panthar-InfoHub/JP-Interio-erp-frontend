import type { StatusTone } from "@/components/common/StatusBadge";
import type { TicketStatus } from "@/lib/api/tickets.api";

/** A ticket's status: words and colours (DEC-295). */
export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Open", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

/** A status filter for one partner's tickets (the list starts on All, DEC-297). */
export const TICKET_FILTER_LABELS: Record<TicketStatus | "unfinished", string> = {
  unfinished: "Unfinished (open + in progress)",
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

/** A status from the API that this screen may not know yet still shows as text. */
export function ticketStatus(status: string): { label: string; tone: StatusTone } {
  return TICKET_STATUS[status as TicketStatus] ?? { label: status, tone: "neutral" };
}
