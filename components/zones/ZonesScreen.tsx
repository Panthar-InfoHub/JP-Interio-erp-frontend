"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { zoneColumns } from "@/components/zones/zoneColumns";
import { ZoneFormDialog } from "@/components/zones/ZoneFormDialog";
import { useZoneList } from "@/hooks/zones/useZones";
import { useListParams } from "@/hooks/useListParams";
import { ZONE_STATUS } from "@/lib/labels/zone";

const FILTERS = ["status"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(ZONE_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Zones (Admin, `zones.manage`, DEC-261): the list with its Zonal Head and head counts,
 * and pop-ups to add, edit, set / replace the Zonal Head and switch a zone off / on.
 * A → Z by default; all statuses unless filtered.
 */
export function ZonesScreen() {
  const list = useListParams({ defaultSort: "name", filters: FILTERS });
  const zones = useZoneList(list.query);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title="Zones"
        description="Areas the company is split into. Each zone has one Zonal Head."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus data-icon="inline-start" />
            Add zone
          </Button>
        }
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search name, code, region or state",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
      </DataTableToolbar>

      <DataTable
        columns={zoneColumns}
        data={zones.data?.items}
        getRowId={(row) => row.id}
        meta={zones.data?.meta}
        isPending={zones.isPending}
        isFetching={zones.isFetching}
        error={zones.error}
        onRetry={() => void zones.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No zones match" : "No zones yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Add the first zone, then its Zonal Head."
        }
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />

      {adding ? (
        <ZoneFormDialog zone={null} open onOpenChange={(next) => !next && setAdding(false)} />
      ) : null}
    </>
  );
}
