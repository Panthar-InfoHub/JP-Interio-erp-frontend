import type { MyPermissions, PermissionScope } from "@/types/auth";

/**
 * Every action name the server knows (backend/src/config/capabilities.ts).
 * A typo in `can("...")` is then a compile error instead of a hidden button.
 */
export type Capability =
  | "settings.manage"
  | "sub_admins.manage"
  | "audit.view"
  | "zones.manage"
  | "users.view"
  | "users.pick"
  | "users.create"
  | "users.edit"
  | "users.transfer"
  | "users.deactivate"
  | "sales_exec.create"
  | "sales_exec.transfer"
  | "sales_exec.deactivate"
  | "team.assign_partners"
  | "partners.view"
  | "partners.onboard"
  | "partners.edit"
  | "partners.transfer"
  | "partners.suspend"
  | "partners.payout_accounts"
  | "partners.remove_draft"
  | "kyc.verify"
  | "partner.self"
  | "products.manage"
  | "catalog.view"
  | "qr.view"
  | "qr.generate"
  | "qr.export"
  | "qr.void"
  | "scans.create"
  | "scans.view"
  | "wallet.self"
  | "ledger.view"
  | "ledger.adjust"
  | "reports.points_liability"
  | "payouts.request"
  | "payouts.view"
  | "payouts.approve"
  | "payouts.mark_paid"
  | "requests.create"
  | "requests.view"
  | "requests.handle"
  | "requests.delegate"
  | "tasks.assign"
  | "tasks.view"
  | "tasks.complete"
  | "notifications.manage"
  | "tickets.create"
  | "tickets.handle"
  | "dashboard.view"
  | "reports.view"
  | "fraud.review"
  | "fraud.reverse_scan";

/**
 * Only for showing / hiding things on screen. The server checks every request again
 * and answers 403 if the action is not allowed (R1).
 */
export function hasPermission(
  permissions: MyPermissions | null | undefined,
  action: Capability,
): boolean {
  return Boolean(permissions?.permissions[action]);
}

/** True if any of the actions is allowed (an empty list means "no permission needed"). */
export function hasAnyPermission(
  permissions: MyPermissions | null | undefined,
  actions: readonly Capability[],
): boolean {
  return actions.length === 0 || actions.some((action) => hasPermission(permissions, action));
}

/** `full` = all records, `scoped` = my zone, `own` = my own; null = not allowed. */
export function scopeOf(
  permissions: MyPermissions | null | undefined,
  action: Capability,
): PermissionScope | null {
  return permissions?.permissions[action] ?? null;
}
