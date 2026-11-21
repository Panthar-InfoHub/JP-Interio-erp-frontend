"use client";

import { useTable, type Header, type RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { EmptyState, ErrorState } from "@/components/common/StateMessages";
import {
  dataTableFeatures,
  type DataColumns,
  type DataTableFeatures,
} from "@/components/data-table/columns";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { nextSort, SortableHeader, sortDirection } from "@/components/data-table/SortableHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types/api-response";

// One shared empty array: a new [] on every render would make the table redo its work.
const NO_ROWS: never[] = [];
const SKELETON_ROWS = 6;

export interface DataTableProps<T extends RowData> {
  /** Stable columns (module level or useMemo), made with `createColumns<T>()`. */
  columns: DataColumns<T>;
  /** The rows of the current page, straight from the query (undefined while loading). */
  data: T[] | undefined;
  getRowId: (row: T) => string;
  meta?: PageMeta;
  isPending: boolean;
  /** True while a new page loads in the background (the old page stays visible). */
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Current sort from the address, e.g. "-createdAt". */
  sort: string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** Opens a row (e.g. its details page). Rows are not clickable without it. */
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** "Clear filters" etc., shown in the empty state. */
  emptyAction?: ReactNode;
}

function headerLabel<T extends RowData>(header: Header<DataTableFeatures, T, unknown>): string {
  const def = header.column.columnDef;
  if (def.meta?.label) return def.meta.label;
  return typeof def.header === "string" ? def.header : "";
}

/**
 * The panel's list table. Paging, sorting and filters happen on the server; this only
 * shows one page. Desktop: a table. Phone: one card per row. Handles loading, empty
 * and error states.
 */
export function DataTable<T extends RowData>({
  columns,
  data,
  getRowId,
  meta,
  isPending,
  isFetching = false,
  error,
  onRetry,
  sort,
  onSortChange,
  onPageChange,
  onLimitChange,
  onRowClick,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: data ?? (NO_ROWS as T[]),
    getRowId,
  });

  const headers = table.getHeaderGroups()[0]?.headers ?? [];
  const rows = table.getRowModel().rows;
  const showError = Boolean(error) && !data;
  const showSkeleton = isPending && !data;
  const showEmpty = !showSkeleton && !showError && rows.length === 0;

  const clickable = onRowClick
    ? (row: T) => ({
        role: "link" as const,
        tabIndex: 0,
        className: "cursor-pointer",
        onClick: () => onRowClick(row),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === "Enter") onRowClick(row);
        },
      })
    : () => ({});

  return (
    <div>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card shadow-sm transition-opacity",
          isFetching && data && "opacity-60",
        )}
        aria-busy={isPending || isFetching}
      >
        {showError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : showEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        ) : (
          <>
            {/* Desktop and tablet: a real table. */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {headers.map((header) => {
                      const columnMeta = header.column.columnDef.meta;
                      const align = columnMeta?.align ?? "start";
                      const direction = columnMeta?.sortField
                        ? sortDirection(sort, columnMeta.sortField)
                        : null;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn("h-10 px-4", align === "end" && "text-right")}
                          aria-sort={
                            direction === "asc"
                              ? "ascending"
                              : direction === "desc"
                                ? "descending"
                                : undefined
                          }
                        >
                          {header.isPlaceholder ? null : columnMeta?.sortField ? (
                            <SortableHeader
                              direction={direction}
                              align={align}
                              onClick={() =>
                                onSortChange(
                                  nextSort(
                                    sort,
                                    columnMeta.sortField!,
                                    columnMeta.firstSort ?? "asc",
                                  ),
                                )
                              }
                            >
                              <table.FlexRender header={header} />
                            </SortableHeader>
                          ) : (
                            <table.FlexRender header={header} />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showSkeleton
                    ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <TableRow key={index} className="hover:bg-transparent">
                          {headers.map((header) => (
                            <TableCell key={header.id} className="px-4 py-3">
                              <Skeleton className="h-4 w-full max-w-40" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : rows.map((row) => (
                        <TableRow key={row.id} {...clickable(row.original)}>
                          {row.getAllCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "px-4 py-3",
                                cell.column.columnDef.meta?.align === "end" &&
                                  "text-right tabular-nums",
                              )}
                            >
                              <table.FlexRender cell={cell} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Phone: one card per row. */}
            <ul className="divide-y md:hidden">
              {showSkeleton
                ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <li key={index} className="flex flex-col gap-2 p-4">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </li>
                  ))
                : rows.map((row) => {
                    const cells = row
                      .getAllCells()
                      .filter((cell) => !cell.column.columnDef.meta?.hideOnMobile);
                    const primary = cells.find((cell) => cell.column.columnDef.meta?.primary);
                    return (
                      <li
                        key={row.id}
                        className="flex flex-col gap-2 p-4"
                        {...clickable(row.original)}
                      >
                        {primary ? (
                          <div className="font-semibold">
                            <table.FlexRender cell={primary} />
                          </div>
                        ) : null}
                        <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-1.5 text-sm">
                          {cells
                            .filter((cell) => cell !== primary)
                            .map((cell) => {
                              const header = headers.find((h) => h.column.id === cell.column.id);
                              return (
                                <div key={cell.id} className="contents">
                                  <dt className="text-muted-foreground">
                                    {header ? headerLabel(header) : ""}
                                  </dt>
                                  <dd className="min-w-0 break-words">
                                    <table.FlexRender cell={cell} />
                                  </dd>
                                </div>
                              );
                            })}
                        </dl>
                      </li>
                    );
                  })}
            </ul>
          </>
        )}
      </div>

      {meta && !showError && meta.total > 0 ? (
        <DataTablePagination
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={isFetching}
        />
      ) : null}
    </div>
  );
}
