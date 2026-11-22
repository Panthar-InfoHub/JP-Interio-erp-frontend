"use client";

import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { qrCodeColumns } from "@/components/qr-batches/detail/qrCodeColumns";
import { Button } from "@/components/ui/button";
import { useQrBatchCodes } from "@/hooks/qr/useQrBatches";
import { useListParams } from "@/hooks/useListParams";
import { formatCount } from "@/lib/format/number";
import { QR_CODE_STATUS } from "@/lib/labels/qr";

const FILTERS = ["status"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(QR_CODE_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * A batch's codes (DEC-276): status, code search, sort by code or scanned time, paging,
 * all kept in the page address. Default order = the ZIP's codes.csv. Needs <Suspense> above.
 */
export function QrBatchCodesSection({ batchId, quantity }: { batchId: string; quantity: number }) {
  const list = useListParams({ defaultSort: "createdAt", filters: FILTERS });
  const codes = useQrBatchCodes(batchId, list.query);

  return (
    <section aria-labelledby="qr-codes-title" className="mt-6">
      <h2 id="qr-codes-title" className="mb-3 text-lg">
        Codes <span className="text-muted-foreground">({formatCount(quantity)})</span>
      </h2>

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search code, e.g. K7M2",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Code status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="Any status"
          className="sm:w-40"
        />
      </DataTableToolbar>

      <DataTable
        columns={qrCodeColumns}
        data={codes.data?.items}
        getRowId={(row) => row.id}
        meta={codes.data?.meta}
        isPending={codes.isPending}
        isFetching={codes.isFetching}
        error={codes.error}
        onRetry={() => void codes.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No codes match" : "No codes"}
        emptyDescription={
          list.isFiltered ? "Try a different search or clear the filters." : undefined
        }
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </section>
  );
}
