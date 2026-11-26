"use client";

import { CircleCheck, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CompleteTaskDialog } from "@/components/tasks/CompleteTaskDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCan } from "@/hooks/auth/usePermission";
import { useTaskActions } from "@/hooks/tasks/useTasks";
import type { TaskRow } from "@/lib/api/tasks.api";
import { errorMessage } from "@/lib/forms/serverErrors";
import { useAuthStore } from "@/stores/auth.store";

interface DoerTaskActionsProps {
  task: Pick<TaskRow, "id" | "title" | "status" | "isOverdue" | "assignedTo">;
  /** "sm" for list rows. */
  size?: "sm" | "default";
}

/**
 * The doer's buttons (DEC-293): Start (open only, at once, no confirm) and Complete (open or
 * in progress, pop-up with photos). Only for the person the task was given to; the server
 * checks again. Nothing for anyone else or for finished tasks.
 */
export function DoerTaskActions({ task, size = "default" }: DoerTaskActionsProps) {
  const can = useCan();
  const myId = useAuthStore((state) => state.user?.id);
  const { start } = useTaskActions();
  const [completing, setCompleting] = useState(false);

  const isMine = can("tasks.complete") && Boolean(myId) && task.assignedTo?.id === myId;
  const unfinished = task.status === "open" || task.status === "in_progress";
  if (!isMine || !unfinished) return null;

  const runStart = () =>
    start.mutate(task.id, {
      onSuccess: (reply) => toast.success(reply.message ?? "Task started"),
      onError: (error) => toast.error(errorMessage(error)),
    });

  return (
    <div className="flex flex-wrap gap-2">
      {task.status === "open" ? (
        <Button variant="outline" size={size} disabled={start.isPending} onClick={runStart}>
          {start.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Play data-icon="inline-start" />
          )}
          Start
        </Button>
      ) : null}
      <Button size={size} onClick={() => setCompleting(true)}>
        <CircleCheck data-icon="inline-start" />
        Complete
      </Button>

      {completing ? (
        <CompleteTaskDialog
          task={task}
          open
          onOpenChange={(next) => !next && setCompleting(false)}
        />
      ) : null}
    </div>
  );
}
