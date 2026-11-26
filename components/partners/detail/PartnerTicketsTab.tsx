"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { partnerTicketColumns } from "@/components/tickets/ticketColumns";
import { useTicketCategories, useTicketQueue } from "@/hooks/tickets/useTickets";
import { useListParams } from "@/hooks/useListParams";
import { formatCount } from "@/lib/format/number";
import { TICKET_FILTER_LABELS } from "@/lib/labels/ticket";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";
import type { TicketsBox } from "@/types/partner";

/** Own names in the address, so they never clash with the other tabs' filters. */
const FILTERS = ["tktStatus", "tktCategory"] as const;

/**
 * Partner 360 "Tickets" tab (Admin only, DEC-297): this partner's counts from the Partner 360
 * `tickets` box, then their tickets (`GET /tickets?partnerId=`), all by default, with status
 * and category filters, newest first. A row opens the ticket, whose back link returns here.
 * Needs a <Suspense> above it.
 */
export function PartnerTicketsTab({ partnerId, box }: { partnerId: string; box: TicketsBox }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const categories = useTicketCategories();

  const query = useMemo(() => {
    const result: Record<string, string | number> = {
      ...list.query,
      partnerId,
      status: list.filters.tktStatus ?? "all",
    };
    delete result.tktStatus;
    delete result.tktCategory;
    if (list.filters.tktCategory) result.category = list.filters.tktCategory;
    return result;
  }, [list.query, list.filters.tktStatus, list.filters.tktCategory, partnerId]);

  const tickets = useTicketQueue(query);
  const categoryOptions = useMemo(
    () => Object.fromEntries((categories.data ?? []).map((item) => [item.code, item.label])),
    [categories.data],
  );

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Tickets" value={formatCount(box.total)} />
        <StatCard label="Open" value={formatCount(box.open)} />
        <StatCard label="In progress" value={formatCount(box.in_progress)} />
        <StatCard label="Resolved" value={formatCount(box.resolved)} />
        <StatCard label="Rejected" value={formatCount(box.rejected)} />
      </div>

      <DataTableToolbar isFiltered={list.isFiltered} onClear={() => list.clearFilters()}>
        <FilterSelect
          label="Status"
          value={list.filters.tktStatus}
          onChange={(tktStatus) => list.setFilters({ tktStatus })}
          options={TICKET_FILTER_LABELS}
          allLabel="Any status"
          className="sm:w-64"
        />
        <FilterSelect
          label="Category"
          value={list.filters.tktCategory}
          onChange={(tktCategory) => list.setFilters({ tktCategory })}
          options={categoryOptions}
          allLabel="Any category"
          className="sm:w-64"
        />
      </DataTableToolbar>

      <DataTable
        columns={partnerTicketColumns}
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
        onRowClick={(row) =>
          router.push(
            withFrom(`/tickets/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={list.isFiltered ? "No tickets match" : "No tickets yet"}
        emptyDescription={
          list.isFiltered
            ? "Try other filters or clear them."
            : "Problems this partner reports from the app appear here."
        }
      />
    </>
  );
}
