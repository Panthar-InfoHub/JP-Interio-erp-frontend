import type { StaffRole } from "@/types/staff";

export { ACCOUNT_STATUS as STAFF_STATUS } from "@/lib/labels/partner";

/** Staff roles in tier order, for filters. */
export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  sub_admin: "Sub-Admin",
  zonal_head: "Zonal Head",
  asm: "ASM",
  sales_executive: "Sales Executive",
};

/** What a Zonal Head can find in their own zone list (themselves, ASMs, SEs). */
export const ZONE_ROLE_LABELS: Record<string, string> = {
  zonal_head: STAFF_ROLE_LABELS.zonal_head,
  asm: STAFF_ROLE_LABELS.asm,
  sales_executive: STAFF_ROLE_LABELS.sales_executive,
};
