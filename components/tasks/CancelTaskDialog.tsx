"use client";

import { toast } from "sonner";

import { ReasonDialog } from "@/components/common/ReasonDialog";
import { useTaskActions } from "@/hooks/tasks/useTasks";
import { errorMessage } from "@/lib/forms/serverErrors";

/** Same limits as the server (reason 10 – 500, DEC-180). */
const REASON_MIN = 10;
const REASON_MAX = 500;

interface CancelTaskDialogProps {
  task: { id: string; title: string; assignedTo: { name: string | null } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cancel a task (giver or above, DEC-291): a typed reason, free text only. The doer sees the
 * reason on the task. Never deleted. Refusals (e.g. it was just completed) show as a message.
 */
export function CancelTaskDialog({ task, open, onOpenChange }: CancelTaskDialogProps) {
  const { cancel } = useTaskActions();

  return (
    <ReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Cancel "${task.title}"?`}
      description={`${task.assignedTo?.name ?? "The person doing it"} will see the reason. A cancelled task can't be changed or reopened.`}
      label="Reason"
      minLength={REASON_MIN}
      maxLength={REASON_MAX}
      confirmLabel="Cancel task"
      destructive
      pending={cancel.isPending}
      onConfirm={(reason) =>
        cancel.mutate(
          { id: task.id, reason },
          {
            onSuccess: (reply) => {
              toast.success(reply.message ?? "Task cancelled");
              onOpenChange(false);
            },
            onError: (error) => {
              toast.error(errorMessage(error));
              onOpenChange(false);
            },
          },
        )
      }
    />
  );
}
