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
