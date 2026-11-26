import { DetailList, DetailRow } from "@/components/common/DetailList";
import { TaskPersonName } from "@/components/tasks/detail/TaskPersonName";
import type { Task } from "@/lib/api/tasks.api";
import { formatDate, formatDateTime } from "@/lib/format/date";

/** What the task is and who is involved (DEC-292). The zone is fixed when it was given. */
export function TaskDetailsCard({ task }: { task: Task }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Details">
      <h2 className="mb-4 text-base">Details</h2>
      <DetailList>
        <DetailRow label="Category">{task.category}</DetailRow>
        <DetailRow label="Given to">
          <TaskPersonName person={task.assignedTo} showRole />
        </DetailRow>
        <DetailRow label="Given by">
          <TaskPersonName person={task.assignedBy} showRole />
        </DetailRow>
        <DetailRow label="Zone">{task.zone?.name ?? "No zone"}</DetailRow>
        <DetailRow label="Due day">{formatDate(task.dueDate)}</DetailRow>
        <DetailRow label="Given on">{formatDateTime(task.createdAt)}</DetailRow>
        <DetailRow label="Details">
          {task.description ? (
            <span className="whitespace-pre-line">{task.description}</span>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </DetailRow>
      </DetailList>
    </section>
  );
}
