"use client";

import { Ban, MoreHorizontal, Pencil } from "lucide-react";
import { useState } from "react";

import { CancelTaskDialog } from "@/components/tasks/CancelTaskDialog";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@/hooks/auth/usePermission";
import type { TaskRow } from "@/lib/api/tasks.api";
import { canChangeTask } from "@/lib/tasks/taskRules";
import { useAuthStore } from "@/stores/auth.store";

type Open = "edit" | "cancel" | null;

/**
 * The "…" menu on a task row (DEC-291): Edit, Cancel. Shown only to the giver or someone
 * above them, on open / in-progress tasks (DEC-286); the server checks again. Pop-ups mount
 * only while open, so each opening starts fresh.
 */
export function TaskRowActions({ task }: { task: TaskRow }) {
  const [open, setOpen] = useState<Open>(null);
  const can = useCan();
  const me = useAuthStore((state) => state.user);
  const close = () => setOpen(null);

  if (!can("tasks.assign") || !canChangeTask(me, task)) return null;

  return (
    // A click or Enter here (or inside its pop-ups, which React bubbles through this
    // element) must not reach the row, which would open the task (DEC-292).
    <div
      className="flex justify-end"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${task.title}`} />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setOpen("edit")}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setOpen("cancel")}>
            <Ban />
            Cancel task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {open === "edit" ? (
        <EditTaskDialog taskId={task.id} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "cancel" ? (
        <CancelTaskDialog task={task} open onOpenChange={(next) => !next && close()} />
      ) : null}
    </div>
  );
}
