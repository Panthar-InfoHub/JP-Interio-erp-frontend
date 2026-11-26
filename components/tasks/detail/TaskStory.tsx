import type { ReactNode } from "react";

import { TaskPersonName } from "@/components/tasks/detail/TaskPersonName";
import type { Task } from "@/lib/api/tasks.api";
import { formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";

interface StoryLine {
  at: string;
  title: string;
  who: ReactNode;
  tone: "primary" | "warning" | "danger";
}

/** The lines the task's own times allow (the API keeps no edit history, DEC-292). */
function storyOf(task: Task): StoryLine[] {
  const lines: StoryLine[] = [
    {
      at: task.createdAt,
      title: "Given",
      who: <TaskPersonName person={task.assignedBy} />,
      tone: "primary",
    },
  ];
  if (task.startedAt) {
    lines.push({
      at: task.startedAt,
      title: "Started",
      who: <TaskPersonName person={task.assignedTo} />,
      tone: "primary",
    });
  }
  if (task.escalatedAt) {
    lines.push({
      at: task.escalatedAt,
      title: "Overdue: flagged to",
      who: <TaskPersonName person={task.escalatedTo} />,
      tone: "warning",
    });
  }
  if (task.completedAt) {
    lines.push({
      at: task.completedAt,
      title: "Completed",
      who: <TaskPersonName person={task.assignedTo} />,
      tone: "primary",
    });
  }
  if (task.cancelledAt) {
    lines.push({
      at: task.cancelledAt,
      title: "Cancelled",
      who: <TaskPersonName person={task.cancelledBy} />,
      tone: "danger",
    });
  }
  return lines.sort((a, b) => a.at.localeCompare(b.at));
}

const DOT = { primary: "bg-primary", warning: "bg-warning", danger: "bg-destructive" };

/** Given → Started → Flagged → Completed / Cancelled, oldest first, India times (DEC-292). */
export function TaskStory({ task }: { task: Task }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Story">
      <h2 className="mb-4 text-base">Story</h2>
      <ol className="relative flex flex-col gap-5 border-l pl-5">
        {storyOf(task).map((line) => (
          <li key={`${line.title}-${line.at}`} className="relative">
            <span
              className={cn(
                "absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full ring-4 ring-card",
                DOT[line.tone],
              )}
              aria-hidden
            />
            <p className="text-sm">
              <span className="font-semibold">{line.title}</span> · {line.who}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(line.at)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">
        Changes to the title, details or due day aren&apos;t listed here.
      </p>
    </section>
  );
}
