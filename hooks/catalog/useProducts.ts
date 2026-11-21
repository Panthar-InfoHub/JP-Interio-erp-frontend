"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  brandsApi,
  productsApi,
  type ProductCreate,
  type ProductUpdate,
} from "@/lib/api/catalog.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the Products list; the previous page stays on screen while the next loads. */
export function useProductList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.catalog.products(query),
    queryFn: () => productsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/** Every brand, on and off, for the Brand filter and the product form's picker. */
export function useBrandOptions() {
  return useQuery({
    queryKey: queryKeys.catalog.brandOptions,
    queryFn: brandsApi.options,
  });
}

/** Every product change (`products.manage`). Afterwards refresh all catalog data (counts). */
export function useProductActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });

  return {
    create: useMutation({
      mutationFn: (input: ProductCreate) => productsApi.create(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: ProductUpdate }) =>
        productsApi.update(id, changes),
      onSuccess: refresh,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => productsApi.deactivate(id),
      onSuccess: refresh,
    }),
    reactivate: useMutation({
      mutationFn: (id: string) => productsApi.reactivate(id),
      onSuccess: refresh,
    }),
  };
}
