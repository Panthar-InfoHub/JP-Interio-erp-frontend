import type { Capability } from "@/lib/auth/permissions";
import type { RoleKey } from "@/types/auth";
import type { NewStaffRole, StaffDetail } from "@/types/staff";

/** Tier order (DEC-052): you only manage someone strictly below you. */
const TIER: Record<RoleKey, number> = {
  admin: 0,
  sub_admin: 1,
  zonal_head: 1,
  asm: 2,
  sales_executive: 3,
  partner: 4,
};

type Can = (capability: Capability) => boolean;

/**
 * The roles this person may add (users.openapi.yaml "Who can add whom"). Only to choose
 * what the form offers: the server checks the tier and the zone again.
 */
export function addableRoles(myRole: RoleKey | undefined, can: Can): NewStaffRole[] {
  if (myRole === "admin") {
    return ["sub_admin", "zonal_head", "asm", "sales_executive"].filter((role) =>
      role === "sales_executive" ? can("sales_exec.create") : can("users.create"),
    ) as NewStaffRole[];
  }
  if (myRole === "zonal_head") {
    const roles: NewStaffRole[] = [];
    if (can("users.create")) roles.push("asm");
    if (can("sales_exec.create")) roles.push("sales_executive");
    return roles;
  }
  return [];
}

export interface StaffActionFlags {
  edit: boolean;
  /** Switch off (when not deactivated) or switch on (when deactivated). */
  toggle: boolean;
  /** Sales Executive → another ASM; ASM → another zone (Admin only). */
  move: boolean;
}

/**
 * Which actions to show on a staff member's page (comfort only, R1; the server decides).
 * Never on yourself, only on someone strictly below you (DEC-052):
 * - Edit: `users.edit` (Admin any staff, Zonal Head their zone).
 * - Switch off / on: a Sales Executive with `sales_exec.deactivate`; anyone else with
 *   `users.deactivate` (Admin only).
 * - Move: a Sales Executive with `sales_exec.transfer`; an ASM by the Admin only (the
 *   server allows an ASM move only to another zone, DEC-066, DEC-261).
 */
export function staffActionsFor(
  me: { id: string; role: RoleKey } | null,
  can: Can,
  member: StaffDetail,
): StaffActionFlags {
  const none = { edit: false, toggle: false, move: false };
  if (!me || me.id === member.id) return none;
  if (TIER[member.role.key] <= TIER[me.role]) return none;

  const isSe = member.role.key === "sales_executive";
  const active = member.status !== "deactivated";
  return {
    edit: can("users.edit") && active,
    toggle: isSe ? can("sales_exec.deactivate") : can("users.deactivate"),
    move:
      active &&
      ((isSe && can("sales_exec.transfer")) ||
        (member.role.key === "asm" && me.role === "admin" && can("users.transfer"))),
  };
}
