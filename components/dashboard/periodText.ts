import type { DashboardPeriodKey } from "@/types/dashboard";

export const PERIOD_LABELS: Record<DashboardPeriodKey, string> = {
  today: "Today",
  month: "This month",
  all: "All time",
};

/** For card labels: "Scans today", "Scans this month", "Scans (all time)". */
export function inPeriod(label: string, period: DashboardPeriodKey): string {
  if (period === "today") return `${label} today`;
  if (period === "month") return `${label} this month`;
  return `${label} (all time)`;
}

/** Request stages as the client names them (open requests only). */
export const REQUEST_STAGE_LABELS: Record<string, string> = {
  requested: "Requested",
  accepted: "Accepted",
  payment_received: "Payment received",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled, refund not started",
  refund_initiated: "Refund started",
};
