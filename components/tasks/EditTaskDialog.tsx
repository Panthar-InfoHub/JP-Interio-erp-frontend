"use client";

import { ErrorState } from "@/components/common/StateMessages";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTask } from "@/hooks/tasks/useTasks";

interface EditTaskDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit from a list row: list rows have no description, so the full task is loaded first
 * (DEC-291). Shows a short loading pop-up, then the edit form.
 */
export function EditTaskDialog({ taskId, open, onOpenChange }: EditTaskDialogProps) {
  const task = useTask(taskId, open);

  if (task.data) {
    return <TaskFormDialog task={task.data} open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Loading the task…</DialogDescription>
        </DialogHeader>
        {task.error ? (
          <ErrorState error={task.error} onRetry={() => void task.refetch()} />
        ) : (
          <div className="grid gap-3" aria-busy>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
