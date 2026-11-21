import Link from "next/link";

import { BrandRowActions } from "@/components/brands/BrandRowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import type { Brand } from "@/lib/api/catalog.api";
import { formatDate } from "@/lib/format/date";
import { catalogStatus } from "@/lib/labels/catalog";

const col = createColumns<Brand>();

/** Brands list columns (stable, defined once). No details page: actions sit on the row. */
export const brandColumns = col.columns([
  col.accessor("name", {
    header: "Brand",
    cell: (info) => <p className="truncate font-semibold">{info.getValue()}</p>,
    meta: { sortField: "name", primary: true },
  }),
  col.accessor("code", {
    header: "Code",
    cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    meta: { sortField: "code" },
  }),
  col.accessor((row) => row.productCounts.total, {
    id: "products",
    header: "Products",
    cell: (info) => {
      const row = info.row.original;
      const counts = row.productCounts;
      if (counts.total === 0) return <span className="text-muted-foreground">No products</span>;
      // Opens the Products list filtered to this brand (DEC-268).
      return (
        <Link
          href={`/products?brandId=${row.id}`}
          className="whitespace-nowrap text-muted-foreground hover:underline"
          title="Open this brand's products"
        >
          <span className="font-semibold text-foreground">{counts.total}</span>{" "}
          {counts.total === 1 ? "product" : "products"} ·{" "}
          <span className="font-semibold text-foreground">{counts.active}</span> on ·{" "}
          <span className="font-semibold text-foreground">{counts.inactive}</span> off
        </Link>
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
    cell: (info) => <BrandRowActions brand={info.row.original} />,
    meta: { label: "Actions" },
  }),
]);
