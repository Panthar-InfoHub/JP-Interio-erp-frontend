/**
 * Upload purposes the web console uses, with the server's limits
 * (backend/src/config/uploads.ts, docs/api/uploads.openapi.yaml). Checked here first so
 * the person gets a clear message before anything is sent; the server checks again.
 */
export type UploadPurpose = "product_image" | "payout_proof" | "task_photo";

export type UploadContentType =
  "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";

const FIVE_MB = 5 * 1024 * 1024;

export const UPLOAD_RULES: Record<
  UploadPurpose,
  { types: readonly UploadContentType[]; maxBytes: number; typesLabel: string }
> = {
  product_image: {
    types: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: FIVE_MB,
    typesLabel: "JPG, PNG or WebP",
  },
  payout_proof: {
    types: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    maxBytes: FIVE_MB,
    typesLabel: "PDF, JPG, PNG, WebP or HEIC",
  },
  task_photo: {
    types: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    maxBytes: FIVE_MB,
    typesLabel: "JPG, PNG, WebP or HEIC",
  },
};

/** For `<input type="file" accept=…>`. */
export function acceptFor(purpose: UploadPurpose): string {
  return UPLOAD_RULES[purpose].types.join(",");
}
