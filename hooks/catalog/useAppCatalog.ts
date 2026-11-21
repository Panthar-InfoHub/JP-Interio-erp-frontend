"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { appCatalogApi } from "@/lib/api/catalog.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the app catalog; the previous page stays on screen while the next loads. */
export function useAppCatalogProducts(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.catalog.app.products(query),
    queryFn: () => appCatalogApi.products(query),
    placeholderData: keepPreviousData,
  });
}

/** The app's category filter (switched-on categories only). */
export function useAppCatalogCategories() {
  return useQuery({
    queryKey: queryKeys.catalog.app.categories,
    queryFn: appCatalogApi.categories,
  });
}

/** The app's brand filter (switched-on brands only). */
export function useAppCatalogBrands() {
  return useQuery({
    queryKey: queryKeys.catalog.app.brands,
    queryFn: appCatalogApi.brands,
  });
}
