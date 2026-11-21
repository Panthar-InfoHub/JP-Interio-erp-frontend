"use client";

import { useMemo } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { scanColumns } from "@/components/ledger/partner/scanColumns";
import { usePartnerScans } from "@/hooks/ledger/useLedger";
import { useListParams } from "@/hooks/useListParams";
import { withIstMoments } from "@/lib/format/istDay";
import { formatCount, formatPoints } from "@/lib/format/number";

const FILTERS = ["from", "to"] as const;

/**
 * One partner's scans (`scans.view`, DEC-145), newest first, with a date filter and the
 * totals for the whole filter. Filters live in the page address. Needs a <Suspense> above it.
 */
export function PartnerScansTab({ partnerId }: { partnerId: string }) {
  const list = useListParams({ defaultSort: "-scannedAt", filters: FILTERS });
  const query = useMemo(() => withIstMoments(list.query), [list.query]);
  const scans = usePartnerScans(partnerId, query);
  const totals = scans.data?.totals;

  return (
    <>
      <DataTableToolbar isFiltered={list.isFiltered} onClear={() => list.clearFilters()}>
        <DateRangePicker
          value={{ from: list.filters.from, to: list.filters.to }}
          onChange={(range) => list.setFilters({ from: range.from, to: range.to })}
          className="sm:w-64"
        />
      </DataTableToolbar>

      {totals ? (
        <p className="mb-3 text-sm text-muted-foreground tabular-nums">
          {formatCount(totals.scans)} scans · {formatPoints(totals.points)}
          {list.isFiltered ? " in these dates" : " in total"}
        </p>
      ) : null}

      <DataTable
        columns={scanColumns}
        data={scans.data?.items}
        getRowId={(row) => row.id}
        meta={scans.data?.meta}
        isPending={scans.isPending}
        isFetching={scans.isFetching}
        error={scans.error}
        onRetry={() => void scans.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No scans in these dates" : "No scans yet"}
      />
    </>
  );
}
