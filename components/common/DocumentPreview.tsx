"use client";

import { ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function isPdf(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

/**
 * A KYC document file (DEC-240): photos show as a small thumbnail that opens large in a
 * pop-up; PDFs open in a new tab. Files are public R2 links (DEC-084).
 */
export function DocumentPreview({
  url,
  title,
  thumbClassName = "h-28 w-44",
}: {
  url: string | null | undefined;
  title: string;
  /** Size of the small picture (e.g. "size-12" in a table row). */
  thumbClassName?: string;
}) {
  if (!url) return <span className="text-sm text-muted-foreground">No file</span>;

  if (isPdf(url)) {
    return (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<a href={url} target="_blank" rel="noopener noreferrer" />}
      >
        <FileText data-icon="inline-start" />
        Open PDF
        <ExternalLink data-icon="inline-end" />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`Open ${title} larger`}
            className="group block overflow-hidden rounded-lg border bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        }
      >
        {/* Public R2 photos from many hosts; a plain lazy <img> keeps them simple. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          loading="lazy"
          decoding="async"
          className={cn(thumbClassName, "object-cover transition-transform group-hover:scale-105")}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          decoding="async"
          className="max-h-[75vh] w-full rounded-lg object-contain"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Open in a new tab <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </DialogContent>
    </Dialog>
  );
}
