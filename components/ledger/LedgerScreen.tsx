"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { ledgerColumns } from "@/components/ledger/ledgerColumns";
import { LedgerTotalsBar } from "@/components/ledger/LedgerTotalsBar";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import { useAsmOptions } from "@/hooks/data/useAsmOptions";
import { useLedgerList, useLineMakerOptions } from "@/hooks/ledger/useLedger";
import { useListParams } from "@/hooks/useListParams";
import { withIstMoments } from "@/lib/format/istDay";
import { DIRECTION_LABELS, LINE_TYPE_LABELS } from "@/lib/labels/ledger";
import { useAuthStore } from "@/stores/auth.store";

const FILTERS = ["type", "direction", "from", "to", "zoneId", "asmId", "createdById"] as const;

/**
 * Points ledger across every partner in my scope (DEC-134, DEC-256), newest first, with
 * totals for the whole filter. Admin and the Rewards Sub-Admin see all zones, a Zonal
 * Head their zone (the server decides). A row opens the partner points page.
 */
export function LedgerScreen() {
  const router = useRouter();
  const can = useCan();
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const query = useMemo(() => withIstMoments(list.query), [list.query]);
  const ledger = useLedgerList(query);

  // ASM and "Made by" need the staff list: Admin and Zonal Head only (DEC-256).
  const canPickStaff = can("users.view");
  const asms = useAsmOptions(isZonalHead ? null : list.filters.zoneId, canPickStaff);
  const makers = useLineMakerOptions(canPickStaff);
  const asmOptions = Object.fromEntries(
    (asms.data ?? []).map((asm) => [asm.id, asm.name ?? "Unnamed ASM"]),
  );
  const makerOptions = Object.fromEntries(
    (makers.data ?? []).map((person) => [person.id, person.name ?? "Unnamed"]),
  );

  return (
    <>
      <PageHeader
        title="Points ledger"
        description="Every points move of every partner: scans, cash-outs and adjustments."
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search partner name, mobile or business",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
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
        <ZonePicker
          value={list.filters.zoneId}
          // A new zone makes the chosen ASM meaningless: clear it too.
          onChange={(zoneId) => list.setFilters({ zoneId, asmId: null })}
          className="sm:w-44"
        />
        {canPickStaff ? (
          <>
            <FilterSelect
              label="ASM"
              value={list.filters.asmId}
              onChange={(asmId) => list.setFilters({ asmId })}
              options={asmOptions}
              allLabel={asms.isPending ? "Loading ASMs…" : "All ASMs"}
              className="sm:w-48"
            />
            <FilterSelect
              label="Made by"
              value={list.filters.createdById}
              onChange={(createdById) => list.setFilters({ createdById })}
              options={makerOptions}
              allLabel={makers.isPending ? "Loading staff…" : "Made by anyone"}
              className="sm:w-48"
            />
          </>
        ) : null}
      </DataTableToolbar>

      <LedgerTotalsBar totals={ledger.data?.totals} />

      <DataTable
        columns={ledgerColumns}
        data={ledger.data?.items}
        getRowId={(row) => row.id}
        meta={ledger.data?.meta}
        isPending={ledger.isPending}
        isFetching={ledger.isFetching}
        error={ledger.error}
        onRetry={() => void ledger.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/ledger/partner/${row.partner.id}`)}
        emptyTitle={list.isFiltered ? "No lines match" : "No points moves yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Scans, cash-outs and adjustments appear here."
        }
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
