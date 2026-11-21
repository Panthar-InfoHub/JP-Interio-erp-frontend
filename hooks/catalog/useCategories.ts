"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi, type CategoryCreate, type CategoryUpdate } from "@/lib/api/catalog.api";
import { queryKeys } from "@/lib/query/queryKeys";

/** The whole category tree (not paged: a short reference list). */
export function useCategoryTree() {
  return useQuery({
    queryKey: queryKeys.catalog.categoryTree,
    queryFn: categoriesApi.tree,
  });
}

/**
 * Every category change (`products.manage`). Afterwards refresh all catalog data: a
 * switched-off or moved category changes counts and which products the app shows.
 */
export function useCategoryActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all });

  return {
    create: useMutation({
      mutationFn: (input: CategoryCreate) => categoriesApi.create(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: CategoryUpdate }) =>
        categoriesApi.update(id, changes),
      onSuccess: refresh,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => categoriesApi.deactivate(id),
      onSuccess: refresh,
    }),
    reactivate: useMutation({
      mutationFn: (id: string) => categoriesApi.reactivate(id),
      onSuccess: refresh,
    }),
  };
}
