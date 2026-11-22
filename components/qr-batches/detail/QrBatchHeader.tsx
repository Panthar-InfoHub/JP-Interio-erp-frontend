"use client";

import { Ban } from "lucide-react";
import { useState } from "react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { DownloadZipButton } from "@/components/qr-batches/detail/DownloadZipButton";
import { VoidBatchDialog } from "@/components/qr-batches/detail/VoidBatchDialog";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import type { QrBatchDetail } from "@/lib/api/qr.api";
import { qrBatchStatus } from "@/lib/labels/qr";

/**
 * Batch number, status, product, and the two actions (DEC-276): "Download ZIP"
 * (`qr.export`) and "Void batch" (`qr.void`). A voided batch shows neither.
 */
export function QrBatchHeader({ batch }: { batch: QrBatchDetail }) {
  const can = useCan();
  const [voiding, setVoiding] = useState(false);
  const status = qrBatchStatus(batch.status);
  const voided = batch.status === "voided";

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl">{batch.batchNo}</h1>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <p className="mt-1 text-sm wrap-break-word text-muted-foreground">
          {batch.product.name} · {batch.product.sku}
        </p>
      </div>

      {!voided ? (
        <div className="flex flex-wrap gap-2">
          {can("qr.export") ? <DownloadZipButton batch={batch} /> : null}
          {can("qr.void") ? (
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setVoiding(true)}
            >
              <Ban data-icon="inline-start" />
              Void batch
            </Button>
          ) : null}
        </div>
      ) : null}

      {voiding ? (
        <VoidBatchDialog batch={batch} open onOpenChange={(next) => !next && setVoiding(false)} />
      ) : null}
    </div>
  );
}
