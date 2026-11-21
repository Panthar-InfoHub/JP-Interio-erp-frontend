import { Lock } from "lucide-react";

import { DocumentPreview } from "@/components/common/DocumentPreview";
import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { ProductRowActions } from "@/components/products/ProductRowActions";
import type { Product } from "@/lib/api/catalog.api";
import { PATH_SEPARATOR } from "@/lib/catalog/categoryTree";
import { formatDate } from "@/lib/format/date";
import { formatRupees } from "@/lib/format/number";
import { catalogStatus } from "@/lib/labels/catalog";

const col = createColumns<Product>();

/** "18 mm · 8 x 4 ft · BWP", or null. */
function specs(product: Product): string | null {
  const parts = [product.thickness, product.size, product.grade].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Products list columns (stable, defined once). No details page: actions sit on the row. */
export const productColumns = col.columns([
  col.display({
    id: "image",
    header: "",
    // Click = big preview (DEC-270).
    cell: (info) => (
      <DocumentPreview
        url={info.row.original.imageUrl}
        title={info.row.original.name}
        thumbClassName="size-12"
      />
    ),
    meta: { label: "Image" },
  }),
  col.accessor("name", {
    header: "Product",
    cell: (info) => {
      const row = info.row.original;
      const extra = specs(row);
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            {row.sku}
            {row.skuLocked ? (
              <Lock className="size-3" aria-label="SKU locked (has QR batches)" />
            ) : null}
          </p>
          {extra ? <p className="truncate text-xs text-muted-foreground">{extra}</p> : null}
        </div>
      );
    },
    meta: { sortField: "name", primary: true },
  }),
  col.accessor((row) => row.brand.name, {
    id: "brand",
    header: "Brand",
    cell: (info) => <span className="whitespace-nowrap">{info.getValue()}</span>,
  }),
  col.accessor((row) => row.category.path.map((step) => step.name).join(PATH_SEPARATOR), {
    id: "category",
    header: "Category",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
  col.accessor("mrp", {
    header: "MRP",
    cell: (info) => (
      <span className="whitespace-nowrap tabular-nums">{formatRupees(info.getValue())}</span>
    ),
    meta: { sortField: "mrp", align: "end" },
  }),
  col.accessor("visibleInApp", {
    header: "In the app",
    cell: (info) => {
      const row = info.row.original;
      if (row.visibleInApp) return <StatusBadge tone="success">Visible</StatusBadge>;
      // The server's reasons, written out so they read on phones too (DEC-270).
      return (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge tone="warning">Hidden</StatusBadge>
          {row.hiddenBecause.map((reason) => (
            <span key={reason} className="text-xs text-muted-foreground">
              {reason}
            </span>
          ))}
        </div>
      );
    },
  }),
  col.accessor("active", {
    header: "Status",
    cell: (info) => {
      const status = catalogStatus(info.getValue());
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("createdAt", {
    header: "Added",
    cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc", hideOnMobile: true },
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (info) => <ProductRowActions product={info.row.original} />,
    meta: { label: "Actions" },
  }),
]);
