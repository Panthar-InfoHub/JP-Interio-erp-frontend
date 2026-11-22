"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { MakeBatchDialog } from "@/components/qr-batches/MakeBatchDialog";
import { qrBatchColumns } from "@/components/qr-batches/qrBatchColumns";
import { QrCodeLookupBox } from "@/components/qr-batches/lookup/QrCodeLookupBox";
import { QrProductFilter } from "@/components/qr-batches/QrProductFilter";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import { useQrBatchList } from "@/hooks/qr/useQrBatches";
import { useListParams } from "@/hooks/useListParams";
import type { QrPickerProduct } from "@/lib/api/qr.api";
import { withIstMoments } from "@/lib/format/istDay";
import { QR_BATCH_STATUS } from "@/lib/labels/qr";

const FILTERS = ["status", "productId", "from", "to"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(QR_BATCH_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * QR batches (Admin, QR Batches Sub-Admin, `qr.view`, DEC-274, DEC-275): every batch,
 * newest first, with its code counts, total points and downloads. Filters: batch-number
 * search, status, product (also from a row's product link) and the day it was made.
 * "Make a batch" (`qr.generate`) opens a pop-up; a row opens the batch's page.
 */
export function QrBatchesScreen() {
  const router = useRouter();
  const can = useCan();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const [making, setMaking] = useState(false);
  // The name of a product chosen in the filter (a row link only puts its id in the address).
  const [pickedProduct, setPickedProduct] = useState<QrPickerProduct | null>(null);

  // The address keeps plain days; the API wants India-time moments named createdFrom / createdTo.
  const query = useMemo(() => {
    const result = withIstMoments(list.query);
    if (result.from !== undefined) result.createdFrom = result.from;
    if (result.to !== undefined) result.createdTo = result.to;
    delete result.from;
    delete result.to;
    return result;
  }, [list.query]);

  const batches = useQrBatchList(query);
  const { status, productId, from, to } = list.filters;

  const productLabel = (() => {
    if (!productId) return "";
    const known =
      pickedProduct?.id === productId
        ? pickedProduct
        : batches.data?.items.find((batch) => batch.product.id === productId)?.product;
    return known ? `${known.name} (${known.sku})` : "One product";
  })();

  return (
    <>
      <PageHeader
        title="QR batches"
        description="Single-use QR codes for product stickers. Make a batch, download the ZIP for printing, or void a batch that must never be scanned."
        actions={
          can("qr.generate") ? (
            <Button onClick={() => setMaking(true)}>
              <Plus data-icon="inline-start" />
              Make a batch
            </Button>
          ) : undefined
        }
      />

      <QrCodeLookupBox />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search batch no., e.g. 2026-0001",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Status"
          value={status}
          onChange={(next) => list.setFilters({ status: next })}
          options={STATUS_OPTIONS}
          allLabel="Any status"
          className="sm:w-44"
        />
        <QrProductFilter
          value={productId}
          valueLabel={productLabel}
          onChange={(product) => {
            setPickedProduct(product);
            list.setFilters({ productId: product?.id ?? null });
          }}
          className="sm:w-64"
        />
        <DateRangePicker
          value={{ from, to }}
          onChange={(range) => list.setFilters({ from: range.from, to: range.to })}
          placeholder="Made: any date"
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={qrBatchColumns}
        data={batches.data?.items}
        getRowId={(row) => row.id}
        meta={batches.data?.meta}
        isPending={batches.isPending}
        isFetching={batches.isFetching}
        error={batches.error}
        onRetry={() => void batches.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/qr-batches/${row.id}`)}
        emptyTitle={list.isFiltered ? "No batches match" : "No QR batches yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Make the first batch for a switched-on product."
        }
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />

      {making ? <MakeBatchDialog open onOpenChange={(next) => !next && setMaking(false)} /> : null}
    </>
  );
}
