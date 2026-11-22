"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { QrBatchDetail } from "@/lib/api/qr.api";
import { formatDateTime } from "@/lib/format/date";
import { formatCount } from "@/lib/format/number";

const FIRST = 5;

/** Every download of the batch, newest first: the latest 5, then "Show all" (DEC-276). */
export function QrBatchDownloads({ batch }: { batch: QrBatchDetail }) {
  const [showAll, setShowAll] = useState(false);
  const downloads = batch.downloads;
  const shown = showAll ? downloads : downloads.slice(0, FIRST);

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Downloads">
      <h2 className="mb-4 text-base">
        Downloads <span className="text-muted-foreground">({formatCount(downloads.length)})</span>
      </h2>
      {downloads.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not downloaded yet.</p>
      ) : (
        <>
          <ol className="flex flex-col divide-y">
            {shown.map((download) => (
              <li
                key={download.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm first:pt-0 last:pb-0"
              >
                <span className="whitespace-nowrap">{formatDateTime(download.createdAt)}</span>
                <span className="text-muted-foreground">{download.exportedBy.name}</span>
              </li>
            ))}
          </ol>
          {downloads.length > FIRST ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? "Show the latest 5" : `Show all ${formatCount(downloads.length)}`}
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}
