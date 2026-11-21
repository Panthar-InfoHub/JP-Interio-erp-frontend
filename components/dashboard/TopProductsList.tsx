import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount, formatPoints } from "@/lib/format/number";
import type { ProductCards } from "@/types/dashboard";

/** Products Sub-Admin: top 5 products by scans in the period. */
export function TopProductsList({ items }: { items: ProductCards["topByScans"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top products by scans</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No scans in this period yet.
          </p>
        ) : (
          <ol className="divide-y">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    <span className="mr-1.5 text-muted-foreground tabular-nums">{item.rank}.</span>
                    {item.product.name}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.product.sku}
                    {item.product.active ? null : <StatusBadge tone="neutral">Off</StatusBadge>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCount(item.scans)} scans
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatPoints(item.points)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
