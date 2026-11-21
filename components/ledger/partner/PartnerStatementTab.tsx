"use client";

import { useMemo } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { statementColumns } from "@/components/ledger/ledgerColumns";
import { Button } from "@/components/ui/button";
import { usePartnerLedger } from "@/hooks/ledger/useLedger";
import { useListParams } from "@/hooks/useListParams";
import { withIstMoments } from "@/lib/format/istDay";
import { DIRECTION_LABELS, LINE_TYPE_LABELS } from "@/lib/labels/ledger";

const FILTERS = ["type", "direction", "from", "to"] as const;

/**
 * One partner's points statement (passbook), newest first, with type / in-out / date
 * filters (DEC-256). Filters live in the page address. Needs a <Suspense> above it.
 */
export function PartnerStatementTab({ partnerId }: { partnerId: string }) {
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const query = useMemo(() => withIstMoments(list.query), [list.query]);
  const lines = usePartnerLedger(partnerId, query);

  return (
    <>
      <DataTableToolbar isFiltered={list.isFiltered} onClear={() => list.clearFilters()}>
        <FilterSelect
          label="Type"
          value={list.filters.type}
          onChange={(type) => list.setFilters({ type })}
          options={LINE_TYPE_LABELS}
          allLabel="All types"
          className="sm:w-48"
        />
        <FilterSelect
          label="In or out"
          value={list.filters.direction}
          onChange={(direction) => list.setFilters({ direction })}
          options={DIRECTION_LABELS}
          allLabel="In and out"
          className="sm:w-36"
        />
        <DateRangePicker
          value={{ from: list.filters.from, to: list.filters.to }}
          onChange={(range) => list.setFilters({ from: range.from, to: range.to })}
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={statementColumns}
        data={lines.data?.items}
        getRowId={(row) => row.id}
        meta={lines.data?.meta}
        isPending={lines.isPending}
        isFetching={lines.isFetching}
        error={lines.error}
        onRetry={() => void lines.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No lines match" : "No points moves yet"}
        emptyDescription={list.isFiltered ? "Try different filters." : undefined}
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
