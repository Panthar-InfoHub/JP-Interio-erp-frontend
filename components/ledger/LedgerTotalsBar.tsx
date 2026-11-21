import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/format/number";
import { LINE_TYPE_LABELS } from "@/lib/labels/ledger";
import type { LedgerTotals, LineType } from "@/types/ledger";

const TYPE_ORDER = Object.keys(LINE_TYPE_LABELS) as LineType[];

/**
 * Totals for the whole filter, not just this page (DEC-256): lines, points in, points
 * out, and one short line per type. Adjustment points are the net (credits − debits).
 */
export function LedgerTotalsBar({ totals }: { totals: LedgerTotals | null | undefined }) {
  if (!totals) {
    return (
      <div className="mb-4 grid grid-cols-3 gap-3" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const types = TYPE_ORDER.filter((type) => totals.byType[type]);
  return (
    <section aria-label="Totals for this filter" className="mb-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Lines" value={formatCount(totals.lines)} />
        <StatCard label="Points in" value={formatCount(totals.pointsIn)} />
        <StatCard label="Points out" value={formatCount(totals.pointsOut)} />
      </div>
      {types.length > 0 ? (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
          {types.map((type) => {
            const item = totals.byType[type]!;
            return (
              <span key={type}>
                {LINE_TYPE_LABELS[type]}: {formatCount(item.lines)} lines,{" "}
                {type === "adjust" && item.points > 0 ? "+" : ""}
                {formatCount(item.points)} pts
              </span>
            );
          })}
        </p>
      ) : null}
    </section>
  );
}
