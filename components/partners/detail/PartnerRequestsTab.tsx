"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { partnerRequestColumns } from "@/components/requests/requestColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { usePartnerRequests } from "@/hooks/requests/useRequests";
import { useListParams } from "@/hooks/useListParams";
import type { PartnerRequestCounts } from "@/lib/api/requests.api";
import { formatCount, formatRupees } from "@/lib/format/number";
import {
  FINISHED_STAGES,
  OPEN_STAGES,
  REQUEST_KIND_LABELS,
  REQUEST_STAGE,
  requestStage,
} from "@/lib/labels/request";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";

/** Own names in the address, so they never clash with the other tabs' filters. */
const FILTERS = ["reqState", "reqStatus", "reqKind"] as const;

type State = "all" | "open" | "finished";

const STATE_OPTIONS: Record<Exclude<State, "all">, string> = {
  open: "Open only",
  finished: "Finished only",
};

function stageOptions(state: State): Record<string, string> {
  const stages =
    state === "open"
      ? OPEN_STAGES
      : state === "finished"
        ? FINISHED_STAGES
        : (Object.keys(REQUEST_STAGE) as (keyof typeof REQUEST_STAGE)[]);
  return Object.fromEntries(stages.map((stage) => [stage, REQUEST_STAGE[stage].label]));
}

/** Total, open, kinds, completed shipments (count + ₹), and a chip per stage. */
function CountsStrip({ counts }: { counts: PartnerRequestCounts }) {
  const byStatus = Object.entries(counts.byStatus ?? {}).filter(([, count]) => count > 0);
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Requests" value={formatCount(counts.total)} />
        <StatCard label="Open" value={formatCount(counts.open)} />
        <StatCard
          label="Shipments / samples"
          value={`${formatCount(counts.byCategory?.shipment)} / ${formatCount(counts.byCategory?.sample)}`}
        />
        <StatCard
          label="Completed shipments"
          value={formatCount(counts.completedShipments?.count)}
          hint={formatRupees(counts.completedShipments?.amount ?? 0)}
        />
      </div>
      {byStatus.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-label="Requests by stage">
          {byStatus.map(([status, count]) => {
            const stage = requestStage(status);
            return (
              <StatusBadge key={status} tone={stage.tone}>
                {stage.label} · {formatCount(count)}
              </StatusBadge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Partner 360 "Requests" tab (`requests.view`, DEC-283): counts of this partner's requests
 * I may see (they ignore the filters), then the list (`GET /partners/{id}/requests`):
 * all by default, open / finished, stage and kind, newest first. A row opens the request,
 * whose back link returns here. Needs a <Suspense> above it.
 */
export function PartnerRequestsTab({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const state: State =
    list.filters.reqState === "open" || list.filters.reqState === "finished"
      ? list.filters.reqState
      : "all";

  const query = useMemo(() => {
    const result: Record<string, string | number> = { ...list.query, state };
    delete result.reqState;
    delete result.reqStatus;
    delete result.reqKind;
    if (list.filters.reqStatus) result.status = list.filters.reqStatus;
    if (list.filters.reqKind) result.category = list.filters.reqKind;
    return result;
  }, [list.query, list.filters.reqStatus, list.filters.reqKind, state]);

  const history = usePartnerRequests(partnerId, query);
  const counts = history.data?.counts;

  return (
    <>
      {counts ? (
        <CountsStrip counts={counts} />
      ) : history.isPending ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : null}

      <DataTableToolbar isFiltered={list.isFiltered} onClear={() => list.clearFilters()}>
        <FilterSelect
          label="Open or finished"
          value={state === "all" ? null : state}
          // A stage that doesn't fit the new choice would give an empty list: drop it.
          onChange={(next) => list.setFilters({ reqState: next, reqStatus: null })}
          options={STATE_OPTIONS}
          allLabel="Open and finished"
          className="sm:w-48"
        />
        <FilterSelect
          label="Stage"
          value={list.filters.reqStatus}
          onChange={(reqStatus) => list.setFilters({ reqStatus })}
          options={stageOptions(state)}
          allLabel="Any stage"
          className="sm:w-44"
        />
        <FilterSelect
          label="Kind"
          value={list.filters.reqKind}
          onChange={(reqKind) => list.setFilters({ reqKind })}
          options={REQUEST_KIND_LABELS}
          allLabel="Shipments and samples"
          className="sm:w-52"
        />
      </DataTableToolbar>

      <DataTable
        columns={partnerRequestColumns}
        data={history.data?.items}
        getRowId={(row) => row.id}
        meta={history.data?.meta}
        isPending={history.isPending}
        isFetching={history.isFetching}
        error={history.error}
        onRetry={() => void history.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) =>
          router.push(
            withFrom(`/requests/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={list.isFiltered ? "No requests match" : "No requests yet"}
        emptyDescription={
          list.isFiltered
            ? "Try other filters or clear them."
            : "Shipment and sample requests this partner sends from the app appear here."
        }
      />
    </>
  );
}
