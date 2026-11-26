import type { StatusTone } from "@/components/common/StatusBadge";
import type { TaskPriority, TaskStatus } from "@/lib/api/tasks.api";

/** A task's status: words and colours (DEC-289). */
export const TASK_STATUS: Record<TaskStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Open", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/** A status from the API that this screen may not know yet still shows as text. */
export function taskStatus(status: string): { label: string; tone: StatusTone } {
  return TASK_STATUS[status as TaskStatus] ?? { label: status, tone: "neutral" };
}

/** The list's status filter: one status, or "Unfinished" = open + in progress (DEC-289). */
export const TASK_STATUS_FILTER_LABELS: Record<TaskStatus | "unfinished", string> = {
  unfinished: "Unfinished",
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_PRIORITY: Record<TaskPriority, { label: string; tone: StatusTone }> = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "neutral" },
  low: { label: "Low", tone: "neutral" },
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
