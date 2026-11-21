"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { payoutColumns } from "@/components/payouts/payoutColumns";
import { Button } from "@/components/ui/button";
import { usePayoutList } from "@/hooks/payouts/usePayouts";
import { useListParams } from "@/hooks/useListParams";
import { withIstMoments } from "@/lib/format/istDay";
import { PAID_METHOD_LABELS } from "@/lib/labels/payout";
import { cn } from "@/lib/utils";
import type { PayoutStatus } from "@/types/payout";

const FILTERS = ["status", "zoneId", "paidMethod", "from", "to"] as const;

type Tab = PayoutStatus | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "requested", label: "To approve" },
  { value: "approved", label: "To pay" },
  { value: "paid", label: "Paid" },
  { value: "declined", label: "Declined" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All" },
];

const DEFAULT_TAB: Tab = "requested";

const EMPTY: Record<Tab, { title: string; description?: string }> = {
  requested: {
    title: "Nothing to approve",
    description: "New cash-out requests from partners appear here.",
  },
  approved: { title: "Nothing to pay", description: "Approved payouts wait here to be paid." },
  paid: { title: "No paid payouts yet" },
  declined: { title: "No declined payouts" },
  failed: { title: "No failed payouts" },
  all: { title: "No payouts yet" },
};

/**
 * Payouts in my scope (DEC-156): "To approve" (requested) is the approval queue and
 * "To pay" (approved) the payment worklist. Newest first. Admin and the Rewards
 * Sub-Admin see all zones, a Zonal Head their own zone (the server decides).
 */
export function PayoutsScreen() {
  const router = useRouter();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const tab = TABS.find((item) => item.value === list.filters.status)?.value ?? DEFAULT_TAB;

  // The address keeps plain days and the tab; the API wants a status and India-time moments.
  const query = useMemo(() => {
    const result = withIstMoments(list.query);
    delete result.status;
    if (tab !== "all") result.status = tab;
    return result;
  }, [list.query, tab]);

  const payouts = usePayoutList(query);
  const { zoneId, paidMethod, from, to } = list.filters;
  const hasFilters = Boolean(list.search || zoneId || paidMethod || from || to);
  const empty = EMPTY[tab];

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Partners' cash-out requests. Approve them, then pay outside the platform and mark them paid."
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Payout status"
          className="inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
        >
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() =>
                list.setFilters({ status: item.value === DEFAULT_TAB ? null : item.value })
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                tab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search payout no., name, mobile or business",
        }}
        isFiltered={hasFilters}
        onClear={() => list.clearFilters(["status"])}
      >
        <ZonePicker
          value={zoneId}
          onChange={(next) => list.setFilters({ zoneId: next })}
          className="sm:w-44"
        />
        <FilterSelect
          label="Paid by"
          value={paidMethod}
          onChange={(next) => list.setFilters({ paidMethod: next })}
          options={PAID_METHOD_LABELS}
          allLabel="Any payment method"
          className="sm:w-48"
        />
        <DateRangePicker
          value={{ from, to }}
          onChange={(range) => list.setFilters({ from: range.from, to: range.to })}
          placeholder="Requested: any date"
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={payoutColumns}
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
        emptyTitle={hasFilters ? "No payouts match" : empty.title}
        emptyDescription={
          hasFilters ? "Try a different search or clear the filters." : empty.description
        }
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters(["status"])}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
