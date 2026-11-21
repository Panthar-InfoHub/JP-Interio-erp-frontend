"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CatalogProduct } from "@/lib/api/catalog.api";
import { PATH_SEPARATOR } from "@/lib/catalog/categoryTree";
import { formatRupees } from "@/lib/format/number";

/**
 * One app-catalog product in a pop-up (DEC-271): the big image and what the app shows on a
 * product, from the data already loaded. Read-only.
 */
export function CatalogProductDialog({
  product,
  onClose,
}: {
  product: CatalogProduct | null;
  onClose: () => void;
}) {
  const rows: [string, string][] = product
    ? [
        ["SKU", product.sku],
        ["Brand", product.brand.name],
        ["Category", product.category.path.map((step) => step.name).join(PATH_SEPARATOR)],
        ["MRP", formatRupees(product.mrp)],
        ["Thickness", product.thickness ?? "—"],
        ["Size", product.size ?? "—"],
        ["Grade", product.grade ?? "—"],
      ]
    : [];

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {product ? (
          <>
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid max-h-[75vh] gap-4 overflow-y-auto sm:grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                decoding="async"
                className="aspect-square w-full rounded-lg border bg-muted object-contain"
              />
              <dl className="grid content-start gap-3 text-sm">
                {rows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-semibold break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
