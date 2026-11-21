import { formatCount } from "@/lib/format/number";
import { cn } from "@/lib/utils";
import type { LedgerLine } from "@/types/ledger";

function signed(value: number): string {
  return `${value > 0 ? "+" : "−"}${formatCount(Math.abs(value))}`;
}

/**
 * What a line did to the wallet: the change to available (green in, red out), and the
 * change to held below it when there is one (a cash-out request or its end).
 */
export function PointsChange({ line }: { line: LedgerLine }) {
  const { availableChange, heldChange } = line;
  return (
    <div className="text-right whitespace-nowrap tabular-nums">
      {availableChange !== 0 ? (
        <p
          className={cn("font-semibold", availableChange > 0 ? "text-success" : "text-destructive")}
        >
          {signed(availableChange)} pts
        </p>
      ) : null}
      {heldChange !== 0 ? (
        <p
          className={cn(
            availableChange === 0 ? "font-semibold" : "text-xs",
            "text-muted-foreground",
          )}
        >
          {signed(heldChange)} held
        </p>
      ) : null}
    </div>
  );
}

/** The line's label, plus its reason or the scanned product. */
export function LineDescription({ line }: { line: LedgerLine }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold">{line.label}</p>
      {line.scan ? (
        <p className="truncate text-xs text-muted-foreground">
          {line.scan.productName} · <span className="font-mono">{line.scan.code}</span>
        </p>
      ) : null}
      {line.reason ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">“{line.reason}”</p>
      ) : null}
    </div>
  );
}

/** Who made the line: a staff name, or "System" (scan, automatic refund). */
export function lineMaker(line: LedgerLine): string {
  return line.by ? (line.by.name ?? "—") : "System";
}
