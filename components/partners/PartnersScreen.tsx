"use client";

import { useRouter } from "next/navigation";

import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { partnerColumns } from "@/components/partners/partnerColumns";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import { useAsmOptions } from "@/hooks/data/useAsmOptions";
import { usePartnerList } from "@/hooks/partners/usePartners";
import { useListParams } from "@/hooks/useListParams";
import { ACCOUNT_STATUS, PARTNER_TYPE_LABELS } from "@/lib/labels/partner";
import { useAuthStore } from "@/stores/auth.store";

const FILTERS = ["zoneId", "partnerType", "status", "asmId"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(ACCOUNT_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Verified partners in my scope (DEC-105): Admin and Partners Sub-Admin all zones,
 * Zonal Head their zone (the server decides). Newest first; all statuses (DEC-240).
 */
export function PartnersScreen() {
  const router = useRouter();
  const can = useCan();
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const partners = usePartnerList(list.query);

  // ASM filter: Admin and Zonal Head only (loading ASMs needs users.view, DEC-240).
  const canPickAsm = can("users.view");
  const asms = useAsmOptions(isZonalHead ? null : list.filters.zoneId, canPickAsm);
  const asmOptions = Object.fromEntries(
    (asms.data ?? []).map((asm) => [asm.id, asm.name ?? "Unnamed ASM"]),
  );

  return (
    <>
      <PageHeader
        title="Partners"
        description="Verified partners. Partners waiting for KYC or rejected are in KYC review."
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search name, mobile or business",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <ZonePicker
          value={list.filters.zoneId}
          // A new zone makes the chosen ASM meaningless: clear it too.
          onChange={(zoneId) => list.setFilters({ zoneId, asmId: null })}
          className="sm:w-44"
        />
        <FilterSelect
          label="Partner type"
          value={list.filters.partnerType}
          onChange={(partnerType) => list.setFilters({ partnerType })}
          options={PARTNER_TYPE_LABELS}
          allLabel="All types"
        />
        <FilterSelect
          label="Status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
        {canPickAsm ? (
          <FilterSelect
            label="ASM"
            value={list.filters.asmId}
            onChange={(asmId) => list.setFilters({ asmId })}
            options={asmOptions}
            allLabel={asms.isPending ? "Loading ASMs…" : "All ASMs"}
            className="sm:w-52"
          />
        ) : null}
      </DataTableToolbar>

      <DataTable
        columns={partnerColumns}
        data={partners.data?.items}
        getRowId={(row) => row.id}
        meta={partners.data?.meta}
        isPending={partners.isPending}
        isFetching={partners.isFetching}
        error={partners.error}
        onRetry={() => void partners.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/partners/${row.id}`)}
        emptyTitle={list.isFiltered ? "No partners match" : "No verified partners yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Partners appear here once their KYC is approved."
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
