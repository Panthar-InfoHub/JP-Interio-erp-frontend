import type { RoleKey, SubAdminArea } from "@/types/auth";

const ROLE_LABELS: Record<RoleKey, string> = {
  admin: "Admin",
  sub_admin: "Sub-Admin",
  zonal_head: "Zonal Head",
  asm: "ASM",
  sales_executive: "Sales Executive",
  partner: "Partner",
};

/** Sub-Admin area names as the client uses them (Permission Matrix). */
const AREA_LABELS: Record<SubAdminArea, string> = {
  partners: "Partners & KYC",
  rewards: "Rewards & Payouts",
  products: "Products & Catalog",
  qr: "QR Batches",
  tasks: "Tasks",
  requests: "Requests",
};

/** What each area unlocks (docs/api/settings-permissions.openapi.yaml, DEC-302). */
const AREA_UNLOCKS: Record<SubAdminArea, string> = {
  partners: "Partners & KYC review; Partners and Regions reports.",
  rewards:
    "Points ledger, adjustments and payouts; Scans, Points issued, Payouts reports and points liability.",
  products: "Brands, categories and products; Products report.",
  qr: "QR batches; Scans report.",
  tasks: "Give, edit, cancel and see all field tasks; Tasks report.",
  requests: "Shipment and sample requests; Requests report.",
};

export function areaUnlocks(area: SubAdminArea): string {
  return AREA_UNLOCKS[area];
}

/** Every Sub-Admin area, in the order to offer them. */
export const SUB_ADMIN_AREAS = Object.keys(AREA_LABELS) as SubAdminArea[];

export function roleLabel(role: RoleKey): string {
  return ROLE_LABELS[role];
}

export function areaLabel(area: SubAdminArea): string {
  return AREA_LABELS[area];
}

/** Two letters for the avatar ("Ravi Kumar" → "RK"). */
export function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}
