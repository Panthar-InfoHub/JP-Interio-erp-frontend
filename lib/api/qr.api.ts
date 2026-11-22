import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import { downloadFile } from "@/lib/files/download";
import type { components, operations } from "@/types/api/qr";

type Schemas = components["schemas"];
/** The `data` of an operation's 200 JSON answer, from the generated types. */
type Ok<Op extends keyof operations> = NonNullable<
  (operations[Op]["responses"] extends { 200: infer R } ? R : never) extends {
    content: { "application/json": { data?: infer D } };
  }
    ? D
    : never
>;

export type QrBatchStatus = Schemas["BatchStatus"];
export type QrCodeStatus = Schemas["CodeStatus"];
export type QrCodeCounts = Schemas["CodeCounts"];
export type QrBatchCreate = Schemas["BatchCreate"];
export type QrBatchSummary = Schemas["BatchSummary"];
/** A batch in the list: the summary plus its code counts. */
export type QrBatch = QrBatchSummary & { codeCounts: QrCodeCounts };
/** A switched-on product for a new batch; `notes` say when its brand / category is off. */
export type QrPickerProduct = Schemas["PickerProduct"];
/** One batch with its code counts and every download (newest first). */
export type QrBatchDetail = QrBatchSummary & {
  codeCounts: QrCodeCounts;
  downloads: NonNullable<Ok<"getQrBatch">["downloads"]>;
};
export type QrBatchDownload = QrBatchDetail["downloads"][number];
/** One code of a batch, with who scanned it (null while unused). */
export type QrBatchCode = Ok<"listQrBatchCodes">[number];
export type QrScannedBy = Schemas["ScannedBy"];
/** What voiding answers: the batch, whether anything changed, and the counts. */
export type QrVoidResult = Ok<"voidQrBatch">;
/** The full story of one code: status, batch, product, who scanned it and when. */
export type QrCodeLookup = Ok<"lookupQrCode">;

const batchPath = (id: string) => `/qr/batches/${encodeURIComponent(id)}`;

/**
 * QR batches (docs/api/qr.openapi.yaml, Module 7). Admin and the QR Batches Sub-Admin;
 * company-wide, no scope filter. Nothing is deleted; a batch is only ever voided.
 */
export const qrApi = {
  /** `qr.generate`. Only switched-on products (brand / category may be off). Sort name by default. */
  products: (params: ListQuery) => getPage<QrPickerProduct>("/qr/products", { ...params }),

  /** `qr.view`. Newest first; filters status, productId, createdFrom / createdTo, search. */
  batches: (params: ListQuery) => getPage<QrBatch>("/qr/batches", { ...params }),

  /**
   * `qr.generate`. Makes the batch and all its codes at once (a few seconds for thousands).
   * Over the settings' limits → 400 under `body.quantity` / `body.pointsPerCode`;
   * product switched off → 409.
   */
  createBatch: async (input: QrBatchCreate) =>
    (await apiClient.post<ApiSuccess<QrBatchSummary>>("/qr/batches", input)).data,

  /** `qr.view`. The summary, code counts and every download. Unknown → 404. */
  batch: async (id: string) =>
    (await apiClient.get<ApiSuccess<QrBatchDetail>>(batchPath(id))).data.data,

  /** `qr.view`. Paged; default order = the ZIP's codes.csv. Filters status, search. */
  codes: (id: string, params: ListQuery) =>
    getPage<QrBatchCode>(`${batchPath(id)}/codes`, { ...params }),

  /**
   * `qr.export`. The ZIP for printing (same codes every time; each download is logged).
   * The browser can't read the server's file name, so the panel names it (DEC-274).
   * Voided → 409.
   */
  exportZip: (id: string, batchNo: string) =>
    downloadFile(`${batchPath(id)}/export`, {}, `${batchNo}.zip`),

  /**
   * `qr.view`. A plain code (any case; spaces and dashes ignored) or the full QR link,
   * sent URL-encoded. Unknown or badly formed → 404 `QR code not found`.
   */
  lookupCode: async (codeOrLink: string) =>
    (await apiClient.get<ApiSuccess<QrCodeLookup>>(`/qr/codes/${encodeURIComponent(codeOrLink)}`))
      .data.data,

  /** `qr.void`. Permanent; reason 10 – 500. Already voided → 200 with `changed: false`. */
  voidBatch: async (id: string, reason: string) =>
    (await apiClient.post<ApiSuccess<QrVoidResult>>(`${batchPath(id)}/void`, { reason })).data,
};
