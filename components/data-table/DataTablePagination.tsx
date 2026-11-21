"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES } from "@/hooks/useListParams";
import { formatCount } from "@/lib/format/number";
import type { PageMeta } from "@/types/api-response";

interface DataTablePaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

/** "Showing 21–40 of 1,250", page size, previous / next. */
export function DataTablePagination({
  meta,
  onPageChange,
  onLimitChange,
  disabled = false,
}: DataTablePaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const sizes = Object.fromEntries(PAGE_SIZES.map((size) => [String(size), `${size} / page`]));

  return (
    <div className="flex flex-col-reverse gap-3 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground tabular-nums" aria-live="polite">
        {total === 0
          ? "No results"
          : `Showing ${formatCount(first)}–${formatCount(last)} of ${formatCount(total)}`}
      </p>
      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          items={sizes}
          onValueChange={(value) => value && onLimitChange(Number(value))}
          disabled={disabled}
        >
          <SelectTrigger className="w-32" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="hidden text-muted-foreground tabular-nums sm:inline">
          Page {formatCount(page)} of {formatCount(Math.max(totalPages, 1))}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
