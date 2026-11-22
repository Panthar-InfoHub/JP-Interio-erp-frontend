"use client";

import { Check, Search, TriangleAlert } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { ErrorState } from "@/components/common/StateMessages";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QR_PRODUCT_PICKER_LIMIT, useQrProductSearch } from "@/hooks/qr/useQrBatches";
import type { QrPickerProduct } from "@/lib/api/qr.api";
import { PATH_SEPARATOR } from "@/lib/catalog/categoryTree";
import { formatCount } from "@/lib/format/number";
import { cn } from "@/lib/utils";

interface QrProductSearchListProps {
  /** The chosen product's id, or null. */
  selectedId: string | null;
  onSelect: (product: QrPickerProduct) => void;
  /** Put the cursor in the search box at once (inside a pop-over). */
  autoFocus?: boolean;
  /** Height of the scrolling list. */
  listClassName?: string;
}

/**
 * Search the switched-on products for QR batches (`GET /qr/products`, searched on the
 * server, A → Z, DEC-275): photo, name, SKU, brand, category path and the server's notes
 * (e.g. its brand is off, so it is hidden in the app). Shows the first 20 matches.
 */
export function QrProductSearchList({
  selectedId,
  onSelect,
  autoFocus,
  listClassName = "max-h-72",
}: QrProductSearchListProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const products = useQrProductSearch(deferredSearch);
  const items = products.data?.items ?? [];
  const total = products.data?.meta.total ?? 0;

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search SKU or name"
          aria-label="Search products"
          className="pl-8"
          maxLength={100}
          autoFocus={autoFocus}
        />
      </div>

      <ul
        role="listbox"
        aria-label="Products"
        aria-busy={products.isFetching}
        className={cn(
          "flex flex-col gap-0.5 overflow-y-auto rounded-lg border p-1 transition-opacity",
          products.isFetching && products.data && "opacity-60",
          listClassName,
        )}
      >
        {products.isPending ? (
          Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 p-2">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </li>
          ))
        ) : products.error && !products.data ? (
          <li>
            <ErrorState error={products.error} onRetry={() => void products.refetch()} />
          </li>
        ) : items.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            {deferredSearch.trim()
              ? "No switched-on product matches."
              : "No switched-on products yet."}
          </li>
        ) : (
          items.map((product) => {
            const selected = product.id === selectedId;
            return (
              <li key={product.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md p-2 text-left text-sm",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  {/* Public R2 photo; a plain lazy <img> keeps the list light. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-10 shrink-0 rounded-md bg-muted object-cover"
                  />
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className={cn("font-semibold break-words", selected && "text-primary")}>
                      {product.name}
                    </span>
                    <span className="text-xs break-words text-muted-foreground">
                      {product.sku} · {product.brand.name} ·{" "}
                      {product.category.path.map((step) => step.name).join(PATH_SEPARATOR)}
                    </span>
                    {product.notes.map((note) => (
                      <span key={note} className="flex items-start gap-1 text-xs text-warning">
                        <TriangleAlert className="mt-px size-3 shrink-0" aria-hidden />
                        {note}
                      </span>
                    ))}
                  </span>
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-primary",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })
        )}
      </ul>
      {total > QR_PRODUCT_PICKER_LIMIT ? (
        <p className="text-xs text-muted-foreground">
          Showing the first {QR_PRODUCT_PICKER_LIMIT} of {formatCount(total)}. Type more of the SKU
          or name to narrow it down.
        </p>
      ) : null}
    </div>
  );
}
