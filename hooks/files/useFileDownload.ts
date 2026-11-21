"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { isApiError } from "@/lib/api/errors";
import type { ListQuery } from "@/lib/api/paged";
import { downloadFile } from "@/lib/files/download";

/**
 * Download a file (CSV report, QR ZIP) with a "Preparing…" toast and a clear error.
 *   const download = useFileDownload();
 *   download.mutate({ path: "/reports/scans.csv", params, fallbackName: "scans.csv" });
 */
export function useFileDownload() {
  return useMutation({
    mutationFn: async (input: { path: string; params?: ListQuery; fallbackName: string }) => {
      const toastId = toast.loading("Preparing your file…");
      try {
        const result = await downloadFile(input.path, input.params ?? {}, input.fallbackName);
        toast.success(
          result.rowCount === null
            ? "Download started"
            : `Download started (${result.rowCount.toLocaleString("en-IN")} rows)`,
          { id: toastId },
        );
        return result;
      } catch (error) {
        toast.error(isApiError(error) ? error.message : "The download failed. Please try again.", {
          id: toastId,
        });
        throw error;
      }
    },
  });
}
