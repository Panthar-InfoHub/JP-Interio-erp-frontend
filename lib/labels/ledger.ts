import type { LineType } from "@/types/ledger";

/** The 6 line types for the "Type" filter (DEC-256), in the API file's words. */
export const LINE_TYPE_LABELS: Record<LineType, string> = {
  earn: "Scan reward",
  hold: "Cash-out requested",
  release: "Cash-out cancelled",
  redeem: "Cash-out paid",
  refund: "Cash-out failed",
  adjust: "Adjustment",
};

export const DIRECTION_LABELS = { credit: "Points in", debit: "Points out" } as const;
