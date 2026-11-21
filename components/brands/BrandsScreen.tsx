"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { brandColumns } from "@/components/brands/brandColumns";
import { BrandFormDialog } from "@/components/brands/BrandFormDialog";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useBrandList } from "@/hooks/catalog/useBrands";
import { useListParams } from "@/hooks/useListParams";
import { CATALOG_STATUS } from "@/lib/labels/catalog";

const FILTERS = ["status"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(CATALOG_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Brands (Admin, Products & Catalog Sub-Admin, `products.manage`, DEC-267): the list with
 * product counts, and pop-ups to add, edit and switch a brand off / on.
 * A → Z by default; on and off brands unless filtered.
 */
export function BrandsScreen() {
  const list = useListParams({ defaultSort: "name", filters: FILTERS });
  const brands = useBrandList(list.query);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title="Brands"
        description="Every product belongs to one brand. A brand that is off hides its products from the apps."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus data-icon="inline-start" />
            Add brand
          </Button>
        }
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search name or code",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="On and off"
        />
      </DataTableToolbar>

      <DataTable
        columns={brandColumns}
        data={brands.data?.items}
        getRowId={(row) => row.id}
        meta={brands.data?.meta}
        isPending={brands.isPending}
        isFetching={brands.isFetching}
        error={brands.error}
        onRetry={() => void brands.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No brands match" : "No brands yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Add the first brand, then its products."
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
        <BrandFormDialog brand={null} open onOpenChange={(next) => !next && setAdding(false)} />
      ) : null}
    </>
  );
}
