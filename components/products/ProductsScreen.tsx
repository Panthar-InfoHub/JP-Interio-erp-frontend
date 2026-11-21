"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { productColumns } from "@/components/products/productColumns";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { Button } from "@/components/ui/button";
import { useCategoryTree } from "@/hooks/catalog/useCategories";
import { useBrandOptions, useProductList } from "@/hooks/catalog/useProducts";
import { useListParams } from "@/hooks/useListParams";
import { flattenCategoryPaths } from "@/lib/catalog/categoryTree";
import { CATALOG_STATUS } from "@/lib/labels/catalog";

const FILTERS = ["brandId", "categoryId", "status", "thickness", "grade"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(CATALOG_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Products (Admin, Products & Catalog Sub-Admin, `products.manage`, DEC-267, DEC-270): the
 * list with image, brand, category path, MRP and whether the app shows it (with the
 * reasons when hidden); pop-ups to add, edit and switch off / on. Filters: search, brand,
 * category (includes everything below), status, thickness, grade. A → Z by default.
 * The Brands and Categories pages link here with `?brandId=` / `?categoryId=`.
 */
export function ProductsScreen() {
  const list = useListParams({ defaultSort: "name", filters: FILTERS });
  const products = useProductList(list.query);
  const brands = useBrandOptions();
  const categories = useCategoryTree();
  const [adding, setAdding] = useState(false);

  const brandOptions = Object.fromEntries(
    (brands.data ?? []).map((brand) => [
      brand.id,
      brand.active ? brand.name : `${brand.name} (off)`,
    ]),
  );
  const categoryOptions = Object.fromEntries(
    flattenCategoryPaths(categories.data ?? []).map((option) => [
      option.id,
      option.effectiveActive ? option.path : `${option.path} (off)`,
    ]),
  );

  return (
    <>
      <PageHeader
        title="Products"
        description="What partners can request and what QR batches are made for. A product shows in the apps only when it, its brand and its category are all on."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus data-icon="inline-start" />
            Add product
          </Button>
        }
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
          label="Status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="On and off"
          className="sm:w-36"
        />
        <SearchInput
          value={list.filters.thickness ?? ""}
          onChange={(thickness) => list.setFilters({ thickness: thickness || null })}
          placeholder="Thickness"
          className="sm:w-36"
        />
        <SearchInput
          value={list.filters.grade ?? ""}
          onChange={(grade) => list.setFilters({ grade: grade || null })}
          placeholder="Grade"
          className="sm:w-32"
        />
      </DataTableToolbar>

      <DataTable
        columns={productColumns}
        data={products.data?.items}
        getRowId={(row) => row.id}
        meta={products.data?.meta}
        isPending={products.isPending}
        isFetching={products.isFetching}
        error={products.error}
        onRetry={() => void products.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        emptyTitle={list.isFiltered ? "No products match" : "No products yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Add a brand and a category first, then the first product."
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
        <ProductFormDialog product={null} open onOpenChange={(next) => !next && setAdding(false)} />
      ) : null}
    </>
  );
}
