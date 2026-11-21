import type { StatusTone } from "@/components/common/StatusBadge";

/** A brand's / category's / product's own on / off switch (the API's `active`). */
export const CATALOG_STATUS: Record<"active" | "inactive", { label: string; tone: StatusTone }> = {
  active: { label: "On", tone: "success" },
  inactive: { label: "Off", tone: "neutral" },
};

export const catalogStatus = (active: boolean) => CATALOG_STATUS[active ? "active" : "inactive"];
