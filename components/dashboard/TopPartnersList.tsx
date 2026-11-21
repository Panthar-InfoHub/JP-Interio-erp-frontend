import { formatCount, formatPoints } from "@/lib/format/number";
import type { TopPartner } from "@/types/dashboard";

const TYPE_LABELS: Record<string, string> = {
  carpenter: "Carpenter",
  dealer: "Dealer",
  oem: "OEM",
};

/** Top 5 partners by points earned from scans in the period. */
export function TopPartnersList({ items }: { items: TopPartner[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No scans in this period yet.</p>
    );
  }

  return (
    <ol className="divide-y">
      {items.map((item) => {
        const { partner } = item;
        const name = partner.businessName || partner.name || "Unnamed partner";
        const details = [
          partner.businessName && partner.name ? partner.name : null,
          partner.partnerType ? (TYPE_LABELS[partner.partnerType] ?? partner.partnerType) : null,
          partner.zone?.name,
        ].filter(Boolean);
        return (
          <li key={partner.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                <span className="mr-1.5 text-muted-foreground tabular-nums">{item.rank}.</span>
                {name}
              </p>
              {details.length > 0 ? (
                <p className="truncate text-xs text-muted-foreground">{details.join(" · ")}</p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums">{formatPoints(item.points)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatCount(item.scans)} scans
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
