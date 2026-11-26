import { StatusBadge } from "@/components/common/StatusBadge";
import { taskStatus } from "@/lib/labels/task";

/** A task's status badge (DEC-289). */
export function TaskStatusBadge({ status }: { status: string }) {
  const { label, tone } = taskStatus(status);
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

/**
 * "Overdue" (not finished, due day passed) and "Flagged" (the nightly check told the
 * doer's manager). A task completed late keeps its "Flagged" mark as history.
 */
export function TaskDueMarks({
  isOverdue,
  escalatedAt,
}: {
  isOverdue: boolean;
  escalatedAt: string | null;
}) {
  if (!isOverdue && !escalatedAt) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {isOverdue ? <StatusBadge tone="danger">Overdue</StatusBadge> : null}
      {escalatedAt ? <StatusBadge tone="warning">Flagged</StatusBadge> : null}
    </div>
  );
}
