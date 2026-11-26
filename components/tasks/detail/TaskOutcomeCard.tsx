import { DetailList, DetailRow } from "@/components/common/DetailList";
import { DocumentPreview } from "@/components/common/DocumentPreview";
import { TaskPersonName } from "@/components/tasks/detail/TaskPersonName";
import type { Task } from "@/lib/api/tasks.api";
import { formatCount } from "@/lib/format/number";
import { formatDateTime } from "@/lib/format/date";

/**
 * How the task ended (DEC-292): "Completion" (photos as thumbnails that open large, the
 * note) or "Cancelled" (by whom, when, reason). Nothing for unfinished tasks.
 */
export function TaskOutcomeCard({ task }: { task: Task }) {
  if (task.status === "completed") {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Completion">
        <h2 className="mb-4 text-base">Completion</h2>
        <DetailList>
          <DetailRow label="Completed">{formatDateTime(task.completedAt)}</DetailRow>
          <DetailRow label="Note">
            {task.completionNote ? (
              <span className="whitespace-pre-line">{task.completionNote}</span>
            ) : (
              <span className="text-muted-foreground">No note</span>
            )}
          </DetailRow>
        </DetailList>
        <h3 className="mt-5 mb-3 text-sm font-semibold">
          Photos ({formatCount(task.photos.length)})
        </h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {task.photos.map((photo, index) => (
            <li key={photo.id} className="grid gap-1">
              <DocumentPreview
                url={photo.url}
                title={`Photo ${index + 1}`}
                thumbClassName="aspect-square w-full"
              />
              <span className="text-xs text-muted-foreground">
                {formatDateTime(photo.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (task.status === "cancelled") {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Cancelled">
        <h2 className="mb-4 text-base">Cancelled</h2>
        <DetailList>
          <DetailRow label="Cancelled by">
            <TaskPersonName person={task.cancelledBy} showRole />
          </DetailRow>
          <DetailRow label="When">{formatDateTime(task.cancelledAt)}</DetailRow>
          <DetailRow label="Reason">
            {task.cancelReason ? (
              <span className="whitespace-pre-line">{task.cancelReason}</span>
            ) : (
              "—"
            )}
          </DetailRow>
        </DetailList>
      </section>
    );
  }

  return null;
}
