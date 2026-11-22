import type { RequestDetail } from "@/lib/api/requests.api";
import { formatCount } from "@/lib/format/number";

/** The products asked for, as they were named when the request was made (DEC-165). */
export function RequestItemsCard({ items }: { items: RequestDetail["items"] }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Items">
      <h2 className="mb-4 text-base">
        Items <span className="text-muted-foreground">({formatCount(items.length)})</span>
      </h2>
      <ul className="flex flex-col divide-y">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-start justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0"
          >
            <span className="min-w-0">
              <span className="block font-medium wrap-break-word">{item.name}</span>
              <span className="block text-xs text-muted-foreground">{item.sku}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              × {formatCount(item.quantity)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
