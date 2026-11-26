import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { TaskDueMarks, TaskStatusBadge } from "@/components/tasks/TaskBadges";
import { TaskRowActions } from "@/components/tasks/TaskRowActions";
import { roleLabel } from "@/lib/auth/roles";
import type { TaskPerson, TaskRow } from "@/lib/api/tasks.api";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { TASK_PRIORITY } from "@/lib/labels/task";

const col = createColumns<TaskRow>();

function PersonCell({ person, showRole }: { person: TaskPerson; showRole?: boolean }) {
  if (!person) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="min-w-0">
      <p className="truncate">{person.name ?? "Unnamed"}</p>
      {showRole ? <p className="text-xs text-muted-foreground">{roleLabel(person.role)}</p> : null}
    </div>
  );
}

/**
 * Team task list columns (stable, defined once, DEC-289). Sortable only where `GET /tasks`
 * sorts: Due date, Given on, Completed. A row opens the task (DEC-292).
 */
export const taskColumns = col.columns([
  col.accessor("title", {
    header: "Task",
    cell: (info) => (
      <div className="max-w-80 min-w-0">
        <p className="font-semibold wrap-break-word">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">{info.row.original.category}</p>
      </div>
    ),
    meta: { primary: true },
  }),
  col.accessor((row) => row.assignedTo?.name, {
    id: "assignedTo",
    header: "Doer",
    cell: (info) => <PersonCell person={info.row.original.assignedTo} showRole />,
  }),
  col.accessor((row) => row.assignedBy?.name, {
    id: "assignedBy",
    header: "Given by",
    cell: (info) => <PersonCell person={info.row.original.assignedBy} showRole />,
  }),
  col.accessor((row) => row.zone?.name ?? "—", { id: "zone", header: "Zone" }),
  col.accessor("priority", {
    header: "Priority",
    cell: (info) => {
      const priority = TASK_PRIORITY[info.getValue()];
      return priority ? (
        <StatusBadge tone={priority.tone}>{priority.label}</StatusBadge>
      ) : (
        info.getValue()
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <TaskStatusBadge status={info.getValue()} />,
  }),
  col.accessor("dueDate", {
    header: "Due",
    cell: (info) => (
      <div className="grid gap-1">
        <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>
        <TaskDueMarks
          isOverdue={info.row.original.isOverdue}
          escalatedAt={info.row.original.escalatedAt}
        />
      </div>
    ),
    meta: { sortField: "dueDate", firstSort: "asc" },
  }),
  col.accessor("createdAt", {
    header: "Given on",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc", hideOnMobile: true },
  }),
  col.accessor("completedAt", {
    header: "Completed",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    // The server puts tasks not completed yet last, either way.
    meta: { sortField: "completedAt", firstSort: "desc", hideOnMobile: true },
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (info) => <TaskRowActions task={info.row.original} />,
    meta: { label: "Actions" },
  }),
]);
