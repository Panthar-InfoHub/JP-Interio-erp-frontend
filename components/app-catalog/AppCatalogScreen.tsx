"use client";

import { useState } from "react";

import { CatalogProductCard } from "@/components/app-catalog/CatalogProductCard";
import { CatalogProductDialog } from "@/components/app-catalog/CatalogProductDialog";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState, ErrorState } from "@/components/common/StateMessages";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAppCatalogBrands,
  useAppCatalogCategories,
  useAppCatalogProducts,
} from "@/hooks/catalog/useAppCatalog";
import { useListParams } from "@/hooks/useListParams";
import type { CatalogProduct } from "@/lib/api/catalog.api";
import { flattenCategoryPaths } from "@/lib/catalog/categoryTree";
import { cn } from "@/lib/utils";

const FILTERS = ["brandId", "categoryId"] as const;
const DEFAULT_SORT = "name";

/** The default (name A → Z) is the "all" choice; the server's other sorts. */
const SORT_OPTIONS: Record<string, string> = {
  "-name": "Name Z → A",
  mrp: "MRP low → high",
  "-mrp": "MRP high → low",
};

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

function GridSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * App catalog preview (`catalog.view`, every panel role, DEC-271): exactly what partners
 * and field staff see, as product cards. Only products whose product, brand and category
 * chain are on. Filters: search (SKU / name), brand, category (includes below); sort by
 * name or MRP. A card opens a read-only details pop-up.
 */
export function AppCatalogScreen() {
  const list = useListParams({ defaultSort: DEFAULT_SORT, filters: FILTERS });
  const products = useAppCatalogProducts(list.query);
  const brands = useAppCatalogBrands();
  const categories = useAppCatalogCategories();
  const [opened, setOpened] = useState<CatalogProduct | null>(null);

  const brandOptions = Object.fromEntries((brands.data ?? []).map((b) => [b.id, b.name]));
  const categoryOptions = Object.fromEntries(
    flattenCategoryPaths(categories.data ?? []).map((option) => [option.id, option.path]),
  );

  const data = products.data;

  return (
    <>
      <PageHeader
        title="App catalog"
        description="What partners and field staff see in their apps. Products, brands or categories that are switched off are not shown."
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search SKU or name",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Brand"
          value={list.filters.brandId}
          onChange={(brandId) => list.setFilters({ brandId })}
          options={brandOptions}
          allLabel={brands.isPending ? "Loading brands…" : "All brands"}
        />
        <FilterSelect
          label="Category"
          value={list.filters.categoryId}
          onChange={(categoryId) => list.setFilters({ categoryId })}
          options={categoryOptions}
          allLabel={categories.isPending ? "Loading categories…" : "All categories"}
          className="sm:w-56"
        />
        <FilterSelect
          label="Sort"
          value={list.sort === DEFAULT_SORT ? null : list.sort}
          onChange={(sort) => list.setSort(sort ?? DEFAULT_SORT)}
          options={SORT_OPTIONS}
          allLabel="Name A → Z"
        />
      </DataTableToolbar>

      {!data && !products.isError ? (
        <GridSkeleton />
      ) : !data ? (
        <div className="rounded-xl border bg-card">
          <ErrorState error={products.error} onRetry={() => void products.refetch()} />
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            title={list.isFiltered ? "No products match" : "Nothing in the app catalog yet"}
            description={
              list.isFiltered
                ? "Try a different search or clear the filters."
                : "Products show here once the product, its brand and its category are all switched on."
            }
            action={
              list.isFiltered ? (
                <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div
            className={cn(GRID, products.isFetching && "opacity-60 transition-opacity")}
            aria-busy={products.isFetching}
          >
            {data.items.map((product) => (
              <CatalogProductCard key={product.id} product={product} onOpen={setOpened} />
            ))}
          </div>
          <DataTablePagination
            meta={data.meta}
            onPageChange={list.setPage}
            onLimitChange={list.setLimit}
            disabled={products.isFetching}
          />
        </>
      )}

      <CatalogProductDialog product={opened} onClose={() => setOpened(null)} />
    </>
  );
}
