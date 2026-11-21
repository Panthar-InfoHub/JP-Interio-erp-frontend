import type { StatusTone } from "@/components/common/StatusBadge";

export const ZONE_STATUS: Record<"active" | "inactive", { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
};
