import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { DoerTaskActions } from "@/components/tasks/DoerTaskActions";
import { TaskDueMarks, TaskStatusBadge } from "@/components/tasks/TaskBadges";
import { roleLabel } from "@/lib/auth/roles";
import type { TaskRow } from "@/lib/api/tasks.api";
import { formatDate } from "@/lib/format/date";
import { TASK_PRIORITY } from "@/lib/labels/task";

const col = createColumns<TaskRow>();

/**
 * My tasks columns (stable, defined once, DEC-293). Not sortable: each view has its own
 * fixed order on the server. A row opens the task; the quick Start / Complete buttons
 * don't (they stop the click).
 */
export const myTaskColumns = col.columns([
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
  col.accessor((row) => row.assignedBy?.name, {
    id: "assignedBy",
    header: "Given by",
    cell: (info) => {
      const giver = info.row.original.assignedBy;
      if (!giver) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="min-w-0">
          <p className="truncate">{giver.name ?? "Unnamed"}</p>
          <p className="text-xs text-muted-foreground">{roleLabel(giver.role)}</p>
        </div>
      );
    },
  }),
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
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (info) => (
      // Clicks / Enter here (and inside the Complete pop-up) must not open the row.
      <div
        className="flex justify-end"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DoerTaskActions task={info.row.original} size="sm" />
      </div>
    ),
    meta: { label: "Actions" },
  }),
]);
