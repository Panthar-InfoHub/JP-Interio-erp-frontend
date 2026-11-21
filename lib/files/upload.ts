import axios from "axios";

import { UPLOAD_RULES, type UploadContentType, type UploadPurpose } from "@/config/uploads";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { ApiSuccess } from "@/types/api-response";

interface UploadLink {
  uploadUrl: string;
  method: "PUT";
  headers: { "Content-Type": string };
  fileUrl: string;
  expiresAt: string;
}

/** A clear message before uploading, or null if the file fits the purpose. */
export function checkFile(purpose: UploadPurpose, file: File): string | null {
  const rule = UPLOAD_RULES[purpose];
  if (!rule.types.includes(file.type as UploadContentType)) {
    return `This file type isn't allowed. Use ${rule.typesLabel}.`;
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > rule.maxBytes) {
    return `This file is too big. The limit is ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`;
  }
  return null;
}

/**
 * Uploads one file straight to Cloudflare R2 (DEC-084 – DEC-086):
 * 1. the server gives a signed link for this purpose, type and exact size;
 * 2. the browser PUTs the bytes to R2 (no login header: the link carries its signature);
 * 3. returns the public `fileUrl`, which the screen then sends when saving the record.
 */
export async function uploadFile(
  purpose: UploadPurpose,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const problem = checkFile(purpose, file);
  if (problem) throw new ApiError({ status: 400, code: "FILE_NOT_ALLOWED", message: problem });

  const link = (
    await apiClient.post<ApiSuccess<UploadLink>>("/uploads/upload-link", {
      purpose,
      contentType: file.type,
      sizeBytes: file.size,
    })
  ).data.data;

  try {
    // Plain axios: no Authorization header, no session handling for R2.
    await axios.put(link.uploadUrl, file, {
      headers: link.headers,
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  } catch {
    throw new ApiError({
      status: 0,
      code: "UPLOAD_FAILED",
      message: "The file could not be uploaded. Check your connection and try again.",
    });
  }

  return link.fileUrl;
}
