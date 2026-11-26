import type { TaskRow } from "@/lib/api/tasks.api";
import type { Me, RoleKey } from "@/types/auth";

/**
 * Who may do what with tasks, copied from docs/api/tasks.openapi.yaml for showing or hiding
 * buttons only (DEC-286, DEC-291). The server checks everything again (R1).
 */

/** Whom I may give a task to, by my role (server: ASSIGNABLE_ROLES). */
export function assignableRoles(role: RoleKey | undefined): readonly RoleKey[] {
  switch (role) {
    case "admin":
      return ["sub_admin", "zonal_head", "asm", "sales_executive"];
    case "sub_admin":
      return ["zonal_head", "asm", "sales_executive"];
    case "zonal_head":
      return ["asm", "sales_executive"];
    case "asm":
      return ["asm", "sales_executive"];
    default:
      return [];
  }
}

/** Open or in progress: the only tasks that can still be edited or cancelled. */
export function isUnfinished(task: Pick<TaskRow, "status">): boolean {
  return task.status === "open" || task.status === "in_progress";
}

/**
 * May I edit / cancel this task? The giver or someone above them (server: editWhere):
 * Admin → every task; Tasks Sub-Admin → every task not given by the Admin; Zonal Head →
 * tasks they gave, plus tasks an ASM gave in their zone; ASM → tasks they gave. The doer
 * never. Also needs `tasks.assign` (checked by the caller) and an unfinished task.
 */
export function canChangeTask(
  me: Pick<Me, "id" | "role" | "zone"> | null,
  task: Pick<TaskRow, "status" | "assignedBy" | "zone">,
): boolean {
  if (!me || !isUnfinished(task)) return false;
  const giver = task.assignedBy;
  switch (me.role.key) {
    case "admin":
      return true;
    case "sub_admin":
      return giver?.role !== "admin";
    case "zonal_head":
      return (
        giver?.id === me.id ||
        (giver?.role === "asm" && Boolean(me.zone) && task.zone?.id === me.zone?.id)
      );
    case "asm":
      return giver?.id === me.id;
    default:
      return false;
  }
}
