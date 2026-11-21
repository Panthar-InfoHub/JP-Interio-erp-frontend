"use client";

import { PERIOD_LABELS } from "@/components/dashboard/periodText";
import { cn } from "@/lib/utils";
import type { DashboardPeriodKey } from "@/types/dashboard";

const ORDER: DashboardPeriodKey[] = ["today", "month", "all"];

/** Today / This month / All time. */
export function PeriodSwitch({
  value,
  onChange,
}: {
  value: DashboardPeriodKey;
  onChange: (period: DashboardPeriodKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Period"
      className="inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
    >
      {ORDER.map((period) => {
        const active = period === value;
        return (
          <button
            key={period}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(period)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {PERIOD_LABELS[period]}
          </button>
        );
      })}
    </div>
  );
}
