import type { CatalogProduct } from "@/lib/api/catalog.api";
import { formatRupees } from "@/lib/format/number";

/** "18 mm · 8 x 4 ft · BWP", or null. */
export function catalogSpecs(product: CatalogProduct): string | null {
  const parts = [product.thickness, product.size, product.grade].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** One product as the app shows it: image, name, brand, specs, MRP. Click = details (DEC-271). */
export function CatalogProductCard({
  product,
  onOpen,
}: {
  product: CatalogProduct;
  onOpen: (product: CatalogProduct) => void;
}) {
  const specs = catalogSpecs(product);
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {/* Public R2 photos; a plain lazy <img> keeps the grid light. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">{product.brand.name}</p>
        {specs ? <p className="truncate text-xs text-muted-foreground">{specs}</p> : null}
        <p className="mt-auto pt-1 text-sm font-semibold tabular-nums">
          {formatRupees(product.mrp)}
        </p>
      </div>
    </button>
  );
}
