"use client";

import { Ban, Pencil } from "lucide-react";
import { useState } from "react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { CancelTaskDialog } from "@/components/tasks/CancelTaskDialog";
import { DoerTaskActions } from "@/components/tasks/DoerTaskActions";
import { TaskDueMarks, TaskStatusBadge } from "@/components/tasks/TaskBadges";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import type { Task } from "@/lib/api/tasks.api";
import { formatDate } from "@/lib/format/date";
import { TASK_PRIORITY } from "@/lib/labels/task";
import { canChangeTask } from "@/lib/tasks/taskRules";
import { useAuthStore } from "@/stores/auth.store";

type Open = "edit" | "cancel" | null;

/**
 * The task's head (DEC-292): title, status, priority, Overdue / Flagged marks, due day and
 * category; Start / Complete for the doer (DEC-293) and Edit / Cancel for the giver or
 * someone above them while it is unfinished. After any of them the page stays and refreshes
 * (the buttons go once the task is locked). The doer can never edit or cancel, so the two
 * button sets never show together.
 */
export function TaskSummary({ task }: { task: Task }) {
  const [open, setOpen] = useState<Open>(null);
  const can = useCan();
  const me = useAuthStore((state) => state.user);
  const mayChange = can("tasks.assign") && canChangeTask(me, task);
  const priority = TASK_PRIORITY[task.priority];
  const close = () => setOpen(null);

  return (
    <section
      aria-label="Task"
      className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl wrap-break-word">{task.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            {priority ? (
              <StatusBadge tone={priority.tone}>{priority.label} priority</StatusBadge>
            ) : null}
            <TaskDueMarks isOverdue={task.isOverdue} escalatedAt={task.escalatedAt} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {task.category} · due {formatDate(task.dueDate)}
          </p>
        </div>
        {/* The doer's Start / Complete (T4, DEC-293); the giver's Edit / Cancel. */}
        <DoerTaskActions task={task} />
        {mayChange ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpen("edit")}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setOpen("cancel")}>
              <Ban data-icon="inline-start" />
              Cancel task
            </Button>
          </div>
        ) : null}
      </div>

      {open === "edit" ? (
        <TaskFormDialog task={task} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "cancel" ? (
        <CancelTaskDialog task={task} open onOpenChange={(next) => !next && close()} />
      ) : null}
    </section>
  );
}
