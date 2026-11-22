"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useExportQrBatch } from "@/hooks/qr/useQrBatches";
import type { QrBatchDetail } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { formatCount } from "@/lib/format/number";

/**
 * "Download ZIP" (`qr.export`, DEC-276). The first download starts at once; a repeat asks
 * first, because the ZIP holds the same codes and printing them again makes duplicate
 * stickers. The file is named `<batchNo>.zip` by the panel (DEC-274).
 */
export function DownloadZipButton({ batch }: { batch: QrBatchDetail }) {
  const download = useExportQrBatch();
  const [confirming, setConfirming] = useState(false);
  const last = batch.downloads[0];
  const times = batch.downloadCount;

  const start = () =>
    download.mutate(
      { id: batch.id, batchNo: batch.batchNo },
      { onSettled: () => setConfirming(false) },
    );

  return (
    <>
      <Button
        disabled={download.isPending}
        onClick={() => (times > 0 ? setConfirming(true) : start())}
      >
        {download.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Download data-icon="inline-start" />
        )}
        {download.isPending ? "Preparing ZIP…" : "Download ZIP"}
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Download ${batch.batchNo} again?`}
        description={
          <>
            It was already downloaded {formatCount(times)} {times === 1 ? "time" : "times"}
            {last ? `, last by ${last.exportedBy.name} on ${formatDateTime(last.createdAt)}` : ""}.
            The ZIP holds the <strong>same codes</strong>: printing them again makes duplicate
            stickers, and each code can be scanned only once.
          </>
        }
        confirmLabel={download.isPending ? "Preparing ZIP…" : "Download again"}
        pending={download.isPending}
        onConfirm={start}
      />
    </>
  );
}
