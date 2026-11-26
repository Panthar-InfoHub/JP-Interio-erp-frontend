"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { TaskDetailsCard } from "@/components/tasks/detail/TaskDetailsCard";
import { TaskOutcomeCard } from "@/components/tasks/detail/TaskOutcomeCard";
import { TaskStory } from "@/components/tasks/detail/TaskStory";
import { TaskSummary } from "@/components/tasks/detail/TaskSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/auth/usePermission";
import { useTask } from "@/hooks/tasks/useTasks";
import { isApiError } from "@/lib/api/errors";
import { safeFrom } from "@/lib/navigation/returnTo";

/**
 * Back to the page that opened it (`?from=`, DEC-283); else "Tasks" for people who see the
 * team list, "My tasks" for everyone else (DEC-292).
 */
function BackLink() {
  const from = safeFrom(useSearchParams().get("from"));
  const seesTeam = useCan()("tasks.view");
  const fallback = seesTeam
    ? { href: "/tasks", label: "Tasks" }
    : { href: "/my-tasks", label: "My tasks" };
  return (
    <Link
      href={from ?? fallback.href}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {from ? "Back" : fallback.label}
    </Link>
  );
}

/**
 * One task in full (DEC-292): head with Edit / Cancel, details, completion photos or the
 * cancel reason, and the story from its times. Shared by the team list and My tasks (T4
 * adds the doer's Start / Complete). Not mine to see → "not found".
 */
export function TaskDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const task = useTask(id);

  if (task.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the task">
          <Skeleton className="h-36 rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (task.isError) {
    // No such task, or not one I may see: the server answers 404 (R2).
    const notFound = isApiError(task.error) && task.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Task not found" />
          ) : (
            <ErrorState error={task.error} onRetry={() => void task.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = task.data;

  return (
    <>
      <BackLink />
      <TaskSummary task={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <TaskDetailsCard task={data} />
          <TaskOutcomeCard task={data} />
        </div>
        <TaskStory task={data} />
      </div>
    </>
  );
}
