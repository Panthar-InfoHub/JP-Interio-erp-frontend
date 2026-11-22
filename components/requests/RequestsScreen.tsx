"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { PersonFilter } from "@/components/common/PersonFilter";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { requestColumns, requestColumnsWithoutZone } from "@/components/requests/requestColumns";
import { Button } from "@/components/ui/button";
import type { PersonOption } from "@/hooks/data/usePeopleSearch";
import { useRequestList } from "@/hooks/requests/useRequests";
import { useListParams } from "@/hooks/useListParams";
import { withIstMoments } from "@/lib/format/istDay";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";
import {
  FINISHED_STAGES,
  OPEN_STAGES,
  REQUEST_KIND_LABELS,
  REQUEST_STAGE,
} from "@/lib/labels/request";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const FILTERS = [
  "state",
  "status",
  "category",
  "zoneId",
  "asmId",
  "handlerId",
  "from",
  "to",
] as const;

type Tab = "open" | "finished" | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "finished", label: "Finished" },
  { value: "all", label: "All" },
];

const DEFAULT_TAB: Tab = "open";

const EMPTY: Record<Tab, { title: string; description?: string }> = {
  open: {
    title: "No open requests",
    description: "New shipment and sample requests from partners appear here.",
  },
  finished: { title: "No finished requests yet" },
  all: { title: "No requests yet" },
};

/** The stage choices that fit a tab ("Cancelled" fits both: paid ones wait for a refund). */
function stageOptions(tab: Tab): Record<string, string> {
  const stages =
    tab === "open"
      ? OPEN_STAGES
      : tab === "finished"
        ? FINISHED_STAGES
        : (Object.keys(REQUEST_STAGE) as (keyof typeof REQUEST_STAGE)[]);
  return Object.fromEntries(stages.map((stage) => [stage, REQUEST_STAGE[stage].label]));
}

/**
 * Shipment and sample requests (`requests.view`, view only, DEC-164, DEC-279 – DEC-281):
 * tabs Open / Finished / All, newest first; search, stage, kind, made-between dates, zone,
 * ASM team and handler. Admin and the Requests Sub-Admin see all zones, a Zonal Head their
 * own (the server decides). A row opens the request.
 */
export function RequestsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const tab = TABS.find((item) => item.value === list.filters.state)?.value ?? DEFAULT_TAB;
  // Names of the people chosen in the filters (a shared link only carries their ids).
  const [picked, setPicked] = useState<Record<string, PersonOption | null>>({});

  // The address keeps plain days and the tab; the API wants a state and India-time moments.
  const query = useMemo(() => {
    const result = withIstMoments(list.query);
    result.state = tab;
    return result;
  }, [list.query, tab]);

  const requests = useRequestList(query);
  const { status, category, zoneId, asmId, handlerId, from, to } = list.filters;
  const hasFilters = Boolean(
    list.search || status || category || zoneId || asmId || handlerId || from || to,
  );
  const empty = EMPTY[tab];
  const rows = requests.data?.items;

  const personLabel = (key: "asmId" | "handlerId", id: string | null, fallback: string) => {
    if (!id) return "";
    const known = picked[key]?.id === id ? picked[key] : null;
    if (known) return known.name ?? "Unnamed";
    const fromRows = rows?.find((row) => row.handler.id === id)?.handler.name;
    return fromRows ?? fallback;
  };

  const pickPerson = (key: "asmId" | "handlerId", person: PersonOption | null) => {
    setPicked((current) => ({ ...current, [key]: person }));
    list.setFilters({ [key]: person?.id ?? null });
  };

  return (
    <>
      <PageHeader
        title="Requests"
        description="Shipment and sample requests from partners. The ASM or Sales Executive handling each one moves it along in the field app; here you can follow them."
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Open or finished"
          className="inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
        >
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              // A stage that doesn't fit the new tab would give an empty list: drop it.
              onClick={() =>
                list.setFilters({
                  state: item.value === DEFAULT_TAB ? null : item.value,
                  status: null,
                })
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
          placeholder: "Search request no., partner, business or mobile",
        }}
        isFiltered={hasFilters}
        onClear={() => list.clearFilters(["state"])}
      >
        <FilterSelect
          label="Stage"
          value={status}
          onChange={(next) => list.setFilters({ status: next })}
          options={stageOptions(tab)}
          allLabel="Any stage"
          className="sm:w-44"
        />
        <FilterSelect
          label="Kind"
          value={category}
          onChange={(next) => list.setFilters({ category: next })}
          options={REQUEST_KIND_LABELS}
          allLabel="Shipments and samples"
          className="sm:w-52"
        />
        <ZonePicker
          value={zoneId}
          onChange={(next) => list.setFilters({ zoneId: next })}
          className="sm:w-44"
        />
        <PersonFilter
          kind="asm"
          value={asmId}
          valueLabel={personLabel("asmId", asmId, "One ASM's team")}
          onChange={(person) => pickPerson("asmId", person)}
          zoneId={zoneId}
          placeholder="Any ASM team"
          className="sm:w-52"
        />
        <PersonFilter
          kind="handler"
          value={handlerId}
          valueLabel={personLabel("handlerId", handlerId, "One handler")}
          onChange={(person) => pickPerson("handlerId", person)}
          zoneId={zoneId}
          placeholder="Any handler"
          className="sm:w-52"
        />
        <DateRangePicker
          value={{ from, to }}
          onChange={(range) => list.setFilters({ from: range.from, to: range.to })}
          placeholder="Made: any date"
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={isZonalHead ? requestColumnsWithoutZone : requestColumns}
        data={rows}
        getRowId={(row) => row.id}
        meta={requests.data?.meta}
        isPending={requests.isPending}
        isFetching={requests.isFetching}
        error={requests.error}
        onRetry={() => void requests.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        // The details page's back link returns to this list with its tab and filters (DEC-283).
        onRowClick={(row) =>
          router.push(
            withFrom(`/requests/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={hasFilters ? "No requests match" : empty.title}
        emptyDescription={
          hasFilters ? "Try a different search or clear the filters." : empty.description
        }
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters(["state"])}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
