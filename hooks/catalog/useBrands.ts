"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { brandsApi, type BrandCreate, type BrandUpdate } from "@/lib/api/catalog.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** One page of the Brands list; the previous page stays on screen while the next loads. */
export function useBrandList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.catalog.brands(query),
    queryFn: () => brandsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

/**
 * Every brand change (`products.manage`). Afterwards refresh all catalog data: a brand
 * switched off changes which products are visible in the app.
 */
export function useBrandActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });

  return {
    create: useMutation({
      mutationFn: (input: BrandCreate) => brandsApi.create(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: BrandUpdate }) =>
        brandsApi.update(id, changes),
      onSuccess: refresh,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => brandsApi.deactivate(id),
      onSuccess: refresh,
    }),
    reactivate: useMutation({
      mutationFn: (id: string) => brandsApi.reactivate(id),
      onSuccess: refresh,
    }),
  };
}
