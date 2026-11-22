"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { QrBatch } from "@/lib/api/qr.api";

/**
 * A batch row's product, as a link that filters the list by that product (DEC-275).
 * Works for a switched-off product too (the filter's search only offers switched-on ones).
 * Keeps the other filters, goes back to page 1, and doesn't open the row.
 */
export function BatchProductLink({ product }: { product: QrBatch["product"] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = new URLSearchParams(searchParams.toString());
  next.set("productId", product.id);
  next.delete("page");

  return (
    <div className="min-w-0">
      <Link
        href={`${pathname}?${next.toString()}`}
        replace
        scroll={false}
        title="Show only this product's batches"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="block truncate font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
      >
        {product.name}
      </Link>
      <p className="truncate text-xs text-muted-foreground">{product.sku}</p>
    </div>
  );
}
