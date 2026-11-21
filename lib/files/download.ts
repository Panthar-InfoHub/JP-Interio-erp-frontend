import { apiClient } from "@/lib/api/client";
import type { ListQuery } from "@/lib/api/paged";

/** The file name from `Content-Disposition: attachment; filename="…"`, if the browser may read it. */
function fileNameFrom(disposition: string | undefined): string | null {
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Downloads a file from the API with the login token (CSV reports, QR ZIPs) and hands
 * it to the browser to save. Goes through apiClient, so an expired token is refreshed
 * and errors become ApiError like everywhere else.
 *
 * `fallbackName` is used when the server's file name can't be read (the API must list
 * Content-Disposition in its CORS exposed headers for the browser to see it).
 */
export async function downloadFile(
  path: string,
  params: ListQuery,
  fallbackName: string,
): Promise<{ fileName: string; rowCount: number | null }> {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );
  const response = await apiClient.get<Blob>(path, {
    params: clean,
    responseType: "blob",
    timeout: 300_000,
  });

  const fileName =
    fileNameFrom(response.headers["content-disposition"] as string | undefined) ?? fallbackName;
  const rowHeader = response.headers["x-row-count"] as string | undefined;

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before freeing the memory.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return { fileName, rowCount: rowHeader ? Number(rowHeader) : null };
}
