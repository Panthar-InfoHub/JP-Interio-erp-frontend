"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { partnerPayoutColumns } from "@/components/payouts/payoutColumns";
import { usePayoutList } from "@/hooks/payouts/usePayouts";
import { useListParams } from "@/hooks/useListParams";
import { PAYOUT_STATUS } from "@/lib/labels/payout";

const FILTERS = ["payoutStatus"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(PAYOUT_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Partner 360 "Payouts" tab (DEC-258): this partner's payouts (`GET /payouts?partnerId=`),
 * newest first, with a status filter. A row opens the payout. Shown only when the server
 * sends the payouts box (`payouts.view`). The filter is named `payoutStatus` in the
 * address so it never clashes with other tabs. Needs a <Suspense> above it.
 */
export function PartnerPayoutsTab({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });

  const query = useMemo(() => {
    const result: Record<string, string | number> = { ...list.query, partnerId };
    delete result.payoutStatus;
    if (list.filters.payoutStatus) result.status = list.filters.payoutStatus;
    return result;
  }, [list.query, list.filters.payoutStatus, partnerId]);

  const payouts = usePayoutList(query);

  return (
    <>
      <DataTableToolbar isFiltered={list.isFiltered} onClear={() => list.clearFilters()}>
        <FilterSelect
          label="Status"
          value={list.filters.payoutStatus}
          onChange={(payoutStatus) => list.setFilters({ payoutStatus })}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
      </DataTableToolbar>

      <DataTable
        columns={partnerPayoutColumns}
        data={payouts.data?.items}
        getRowId={(row) => row.id}
        meta={payouts.data?.meta}
        isPending={payouts.isPending}
        isFetching={payouts.isFetching}
        error={payouts.error}
        onRetry={() => void payouts.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/payouts/${row.id}`)}
        emptyTitle={list.isFiltered ? "No payouts with this status" : "No payouts yet"}
      />
    </>
  );
}
