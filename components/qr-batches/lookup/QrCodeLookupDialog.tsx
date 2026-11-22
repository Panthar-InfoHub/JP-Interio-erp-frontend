"use client";

import Link from "next/link";
import type { ReactNode, RefObject } from "react";

import { CopyButton } from "@/components/common/CopyButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ScannedByCell } from "@/components/qr-batches/detail/ScannedByCell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QrCodeLookup } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { formatPoints } from "@/lib/format/number";
import { qrBatchStatus, qrCodeStatus } from "@/lib/labels/qr";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm wrap-break-word">{children}</dd>
    </div>
  );
}

/**
 * The full story of one looked-up code (DEC-277): code + copy link, status, product,
 * batch (link to its page; void date and reason when voided), and the scan. Read-only.
 * On close the cursor goes back to the lookup box (`returnFocusTo`).
 */
export function QrCodeLookupDialog({
  result,
  onClose,
  returnFocusTo,
}: {
  result: QrCodeLookup | null;
  onClose: () => void;
  returnFocusTo: RefObject<HTMLInputElement | null>;
}) {
  const codeStatus = result ? qrCodeStatus(result.status) : null;
  const batchStatus = result ? qrBatchStatus(result.batch.status) : null;

  return (
    <Dialog open={result !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" finalFocus={returnFocusTo}>
        {result && codeStatus && batchStatus ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <DialogTitle className="font-mono tracking-wide">{result.code}</DialogTitle>
                <CopyButton value={result.link} label="Copy the QR link" />
                <StatusBadge tone={codeStatus.tone}>{codeStatus.label}</StatusBadge>
              </div>
              <DialogDescription>
                {result.status === "scanned"
                  ? "Already used: it can't be scanned again."
                  : result.status === "void"
                    ? "Its batch was voided while it was unused: it can never be scanned."
                    : "Unused: the next verified partner who scans it gets the points."}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid max-h-[65vh] gap-4 overflow-y-auto sm:grid-cols-2">
              <Row label="Product">
                {result.product.name}
                <span className="block text-xs text-muted-foreground">{result.product.sku}</span>
              </Row>
              <Row label="Points">{formatPoints(result.batch.pointsPerCode)}</Row>
              <Row label="Batch">
                <span className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/qr-batches/${result.batch.id}`}
                    onClick={onClose}
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {result.batch.batchNo}
                  </Link>
                  <StatusBadge tone={batchStatus.tone}>{batchStatus.label}</StatusBadge>
                </span>
              </Row>
              <Row label="Made">{formatDateTime(result.batch.createdAt)}</Row>
              {result.batch.voidedAt ? (
                <div className="sm:col-span-2">
                  <Row label="Batch voided">
                    {formatDateTime(result.batch.voidedAt)}
                    {result.batch.voidReason ? (
                      <span className="mt-0.5 block text-muted-foreground">
                        &ldquo;{result.batch.voidReason}&rdquo;
                      </span>
                    ) : null}
                  </Row>
                </div>
              ) : null}
              <Row label="Scanned">
                {result.scannedAt ? formatDateTime(result.scannedAt) : "Not yet"}
              </Row>
              <Row label="Scanned by">
                <ScannedByCell partner={result.scannedBy} />
              </Row>
            </dl>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
