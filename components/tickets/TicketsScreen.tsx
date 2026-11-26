"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { ticketColumns } from "@/components/tickets/ticketColumns";
import { Button } from "@/components/ui/button";
import { useTicketCategories, useTicketQueue } from "@/hooks/tickets/useTickets";
import { useListParams } from "@/hooks/useListParams";
import type { TicketCounts, TicketQueueView } from "@/lib/api/tickets.api";
import { formatCount } from "@/lib/format/number";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";
import { cn } from "@/lib/utils";

const FILTERS = ["status", "category"] as const;

const TABS: { value: TicketQueueView; label: string; empty: string }[] = [
  {
    value: "unfinished",
    label: "Unfinished",
    empty: "No tickets waiting. New ones from partners appear here.",
  },
  { value: "open", label: "Open", empty: "No open tickets." },
  { value: "in_progress", label: "In progress", empty: "No tickets in progress." },
  { value: "resolved", label: "Resolved", empty: "No resolved tickets yet." },
  { value: "rejected", label: "Rejected", empty: "No rejected tickets." },
  { value: "all", label: "All", empty: "No tickets yet." },
];

const DEFAULT_TAB: TicketQueueView = "unfinished";

function countFor(counts: TicketCounts | undefined, view: TicketQueueView): number | undefined {
  if (!counts) return undefined;
  if (view === "all") return counts.open + counts.in_progress + counts.resolved + counts.rejected;
  return counts[view];
}

/**
 * The support ticket queue (Admin only, `tickets.handle`, DEC-295): tabs with counts
 * (Unfinished by default; counts cover every ticket), category, search (ticket no.,
 * partner name or phone), newest first. A row opens the ticket (DEC-296). Only partners
 * raise tickets (partner app).
 */
export function TicketsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const tab = TABS.find((item) => item.value === list.filters.status) ?? TABS[0]!;
  const categories = useTicketCategories();

  // The address leaves the default tab out; the API gets it spelled out.
  const query = useMemo(() => ({ ...list.query, status: tab.value }), [list.query, tab.value]);
  const tickets = useTicketQueue(query);
  const counts = tickets.data?.counts;

  const categoryOptions = useMemo(
    () => Object.fromEntries((categories.data ?? []).map((item) => [item.code, item.label])),
    [categories.data],
  );
  const hasFilters = Boolean(list.search || list.filters.category);

  return (
    <>
      <PageHeader
        title="Support tickets"
        description="Problems partners report from the app. Start working on a ticket, then resolve or reject it with a note the partner will see."
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Ticket status"
          className="inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
        >
          {TABS.map((item) => {
            const selected = tab.value === item.value;
            const count = countFor(counts, item.value);
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() =>
                  list.setFilters({ status: item.value === DEFAULT_TAB ? null : item.value })
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {count !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      selected ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    {formatCount(count)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search ticket no., partner name or phone",
        }}
        isFiltered={hasFilters}
        onClear={() => list.clearFilters(["status"])}
      >
        <FilterSelect
          label="Category"
          value={list.filters.category}
          onChange={(next) => list.setFilters({ category: next })}
          options={categoryOptions}
          allLabel="Any category"
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={ticketColumns}
        data={tickets.data?.items}
        getRowId={(row) => row.id}
        meta={tickets.data?.meta}
        isPending={tickets.isPending}
        isFetching={tickets.isFetching}
        error={tickets.error}
        onRetry={() => void tickets.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        // The ticket page's back link returns to this tab and its filters (DEC-296).
        onRowClick={(row) =>
          router.push(
            withFrom(`/tickets/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={hasFilters ? "No tickets match" : tab.empty}
        emptyDescription={hasFilters ? "Try a different search or clear the filters." : undefined}
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters(["status"])}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
