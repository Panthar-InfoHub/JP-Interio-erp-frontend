"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qrApi, type QrBatchCreate } from "@/lib/api/qr.api";
import { errorMessage } from "@/lib/forms/serverErrors";
import { queryKeys } from "@/lib/query/queryKeys";

/** How many products the picker / filter shows per search (the rest: type more). */
export const QR_PRODUCT_PICKER_LIMIT = 20;

/** One page of the QR batch list; the previous page stays on screen while the next loads. */
export function useQrBatchList(query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.qr.batches(query),
    queryFn: () => qrApi.batches(query),
    placeholderData: keepPreviousData,
  });
}

/**
 * Switched-on products matching a search (SKU or name, searched on the server), A → Z,
 * for the "Make a batch" picker and the list's product filter. Only while `enabled`.
 */
export function useQrProductSearch(search: string, enabled = true) {
  const term = search.trim();
  return useQuery({
    queryKey: queryKeys.qr.products(term),
    queryFn: () =>
      qrApi.products({ search: term || undefined, sort: "name", limit: QR_PRODUCT_PICKER_LIMIT }),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** One batch: summary, code counts, downloads. */
export function useQrBatch(id: string) {
  return useQuery({ queryKey: queryKeys.qr.batch(id), queryFn: () => qrApi.batch(id) });
}

/** One page of a batch's codes; the previous page stays on screen while the next loads. */
export function useQrBatchCodes(id: string, query: Record<string, string | number>) {
  return useQuery({
    queryKey: queryKeys.qr.codes(id, query),
    queryFn: () => qrApi.codes(id, query),
    placeholderData: keepPreviousData,
  });
}

/**
 * Download a batch's ZIP (`qr.export`) with a "Preparing…" toast. Afterwards refresh the
 * QR data: the download is logged and the first one sets the batch to "Downloaded".
 */
export function useExportQrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchNo }: { id: string; batchNo: string }) => {
      const toastId = toast.loading(`Preparing ${batchNo}.zip… a big batch can take a minute.`);
      try {
        const result = await qrApi.exportZip(id, batchNo);
        toast.success(`Download started: ${result.fileName}`, { id: toastId });
        return result;
      } catch (error) {
        toast.error(errorMessage(error, "The download failed. Please try again."), {
          id: toastId,
        });
        throw error;
      }
    },
    // A download that broke half-way may still have been logged: refresh either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.qr.all }),
  });
}

/**
 * Look up one code on demand (the lookup box, DEC-277). A mutation, because it runs on
 * "Look up" rather than on screen; nothing is cached, so each look-up is fresh.
 */
export function useQrCodeLookup() {
  return useMutation({ mutationFn: (codeOrLink: string) => qrApi.lookupCode(codeOrLink) });
}

/** Void a whole batch (`qr.void`, permanent). Afterwards refresh every QR list. */
export function useVoidQrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => qrApi.voidBatch(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qr.all }),
  });
}

/**
 * Make a batch (`qr.generate`). Afterwards refresh every QR list, and the catalog too:
 * the product's SKU is now locked (DEC-122).
 */
export function useCreateQrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QrBatchCreate) => qrApi.createBatch(input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.qr.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all }),
      ]),
  });
}
