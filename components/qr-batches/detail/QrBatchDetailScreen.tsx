"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { QrBatchCodesSection } from "@/components/qr-batches/detail/QrBatchCodesSection";
import { QrBatchDownloads } from "@/components/qr-batches/detail/QrBatchDownloads";
import { QrBatchHeader } from "@/components/qr-batches/detail/QrBatchHeader";
import { QrBatchSummary } from "@/components/qr-batches/detail/QrBatchSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useQrBatch } from "@/hooks/qr/useQrBatches";
import { isApiError } from "@/lib/api/errors";

function BackLink() {
  return (
    <Link
      href="/qr-batches"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      QR batches
    </Link>
  );
}

/**
 * One QR batch (`qr.view`, DEC-276): header with Download ZIP / Void, the numbers and
 * facts, every download, and the batch's codes (paged, filters in the address).
 */
export function QrBatchDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const batch = useQrBatch(id);

  if (batch.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the batch">
          <Skeleton className="h-12 w-64 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </>
    );
  }

  if (batch.isError) {
    const notFound = isApiError(batch.error) && batch.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="QR batch not found" />
          ) : (
            <ErrorState error={batch.error} onRetry={() => void batch.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = batch.data;

  return (
    <>
      <BackLink />
      <QrBatchHeader batch={data} />
      <QrBatchSummary batch={data} />
      <div className="mt-4">
        <QrBatchDownloads batch={data} />
      </div>
      <QrBatchCodesSection batchId={data.id} quantity={data.quantity} />
    </>
  );
}
