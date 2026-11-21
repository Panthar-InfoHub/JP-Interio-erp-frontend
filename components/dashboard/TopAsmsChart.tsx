"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCount, formatPoints } from "@/lib/format/number";
import type { AsmRanking, TopAsm } from "@/types/dashboard";

export const RANKING_LABELS: Record<AsmRanking, string> = {
  points: "Points earned",
  scans: "Scans",
  newPartners: "New partners",
};

function formatValue(value: number, rankedBy: AsmRanking): string {
  return rankedBy === "points" ? formatPoints(value) : formatCount(value);
}

/**
 * Top 5 ASMs as a horizontal bar chart (DEC-236). Drawn in plain HTML (five bars don't
 * need a chart library). One series, so no legend: the title names it.
 * Bars ≤ 24px, rounded at the value end, growing from one baseline; value at the tip;
 * text in text colours; hover / focus shows the exact number.
 */
export function TopAsmsChart({ items, rankedBy }: { items: TopAsm[]; rankedBy: AsmRanking }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No ASM has any {RANKING_LABELS[rankedBy].toLowerCase()} in this period yet.
      </p>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ol className="flex flex-col gap-3" aria-label={`Top ASMs by ${RANKING_LABELS[rankedBy]}`}>
      {items.map((item) => {
        // The longest bar uses 80% of the row, leaving room for its value at the tip.
        const width = Math.max((item.value / max) * 80, 1);
        const name = item.asm.name ?? "Unnamed ASM";
        return (
          <li key={item.asm.id} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                <span className="mr-1.5 text-muted-foreground tabular-nums">{item.rank}.</span>
                {name}
              </p>
              {item.asm.zone ? (
                <p className="truncate text-xs text-muted-foreground">{item.asm.zone.name}</p>
              ) : null}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div
                      tabIndex={0}
                      role="img"
                      aria-label={`${name}: ${formatValue(item.value, rankedBy)}`}
                      className="h-5 shrink-0 rounded-r-[4px] bg-chart-1 transition-opacity outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring/50"
                      style={{ width: `${width}%`, minWidth: "4px" }}
                    />
                  }
                />
                <TooltipContent side="top">
                  {name}: {formatValue(item.value, rankedBy)}
                </TooltipContent>
              </Tooltip>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {formatValue(item.value, rankedBy)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
