"use client";

import { useRouter } from "next/navigation";

import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { kycColumns, kycReviewedColumns } from "@/components/kyc/kycColumns";
import { PageHeader } from "@/components/layout/PageHeader";
import { useKycQueue } from "@/hooks/kyc/useKyc";
import { useListParams } from "@/hooks/useListParams";
import { PARTNER_TYPE_LABELS } from "@/lib/labels/partner";
import { cn } from "@/lib/utils";
import type { KycQueueState } from "@/types/kyc";

const FILTERS = ["state", "zoneId", "partnerType"] as const;

const TABS: { value: KycQueueState; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "verified", label: "Verified" },
];

/**
 * KYC review queue (DEC-239): tabs Pending (default) / Rejected / Verified, oldest
 * submission first. Zonal Head: own zone; Partners Sub-Admin and Admin: all zones.
 */
export function KycQueueScreen() {
  const router = useRouter();
  const list = useListParams({ defaultSort: "submittedAt", filters: FILTERS });
  const state = (list.filters.state as KycQueueState | null) ?? "pending";
  const queue = useKycQueue({ ...list.query, state });
  const isPending = state === "pending";
  const hasFilters = Boolean(list.search || list.filters.zoneId || list.filters.partnerType);

  return (
    <>
      <PageHeader
        title="KYC review"
        description="Check submitted partners. Approving makes them verified; rejecting is final."
      />

      <div
        role="tablist"
        aria-label="KYC state"
        className="mb-4 inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={state === tab.value}
            onClick={() => list.setFilters({ state: tab.value === "pending" ? null : tab.value })}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              state === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search name, mobile or business",
        }}
        isFiltered={hasFilters}
        onClear={() => list.clearFilters(["state"])}
      >
        <ZonePicker
          value={list.filters.zoneId}
          onChange={(zoneId) => list.setFilters({ zoneId })}
          className="sm:w-44"
        />
        <FilterSelect
          label="Partner type"
          value={list.filters.partnerType}
          onChange={(partnerType) => list.setFilters({ partnerType })}
          options={PARTNER_TYPE_LABELS}
          allLabel="All types"
        />
      </DataTableToolbar>

      <DataTable
        columns={isPending ? kycColumns : kycReviewedColumns}
        data={queue.data?.items}
        getRowId={(row) => row.partnerId}
        meta={queue.data?.meta}
        isPending={queue.isPending}
        isFetching={queue.isFetching}
        error={queue.error}
        onRetry={() => void queue.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/kyc/${row.partnerId}`)}
        emptyTitle={
          hasFilters
            ? "No partners match"
            : isPending
              ? "Nothing to check"
              : state === "rejected"
                ? "No rejected partners"
                : "No verified partners yet"
        }
        emptyDescription={
          hasFilters
            ? "Try a different search or clear the filters."
            : isPending
              ? "New sign-ups appear here once they are submitted."
              : undefined
        }
      />
    </>
  );
}
