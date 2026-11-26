"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { myTaskColumns } from "@/components/my-tasks/myTaskColumns";
import { useMyTasks } from "@/hooks/tasks/useTasks";
import { useListParams } from "@/hooks/useListParams";
import type { MyTaskView } from "@/lib/api/tasks.api";
import { formatCount } from "@/lib/format/number";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";
import { cn } from "@/lib/utils";

const TABS: { value: MyTaskView; label: string; empty: string }[] = [
  { value: "unfinished", label: "Unfinished", empty: "Nothing to do right now." },
  { value: "today", label: "Today", empty: "Nothing due today." },
  { value: "upcoming", label: "Upcoming", empty: "Nothing due later." },
  { value: "overdue", label: "Overdue", empty: "Nothing is overdue." },
  { value: "completed", label: "Completed", empty: "No completed tasks yet." },
  { value: "cancelled", label: "Cancelled", empty: "No cancelled tasks." },
];

const DEFAULT_TAB: MyTaskView = "unfinished";

/**
 * Tasks given to me (`tasks.complete`: every Sub-Admin and the Zonal Head, zone-free,
 * DEC-238, DEC-293): tabs with counts kept in the address (`?tab=`), one fixed order per
 * view (soonest due first; finished views newest first). A row opens the task; Start and
 * Complete sit on each unfinished row too.
 */
export function MyTasksScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useListParams({ defaultSort: "dueDate", filters: ["tab"] as const });
  const tab = TABS.find((item) => item.value === list.filters.tab) ?? TABS[0]!;

  // This endpoint has no sort or search: send only the view and the page.
  const query = useMemo(
    () => ({ view: tab.value, page: list.page, limit: list.limit }),
    [tab.value, list.page, list.limit],
  );
  const tasks = useMyTasks(query);
  const counts = tasks.data?.counts;

  return (
    <>
      <PageHeader
        title="My tasks"
        description="Tasks given to you. Start one when you begin (optional), and complete it with photos when it's done."
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Which tasks"
          className="inline-flex rounded-lg border bg-card p-0.5 shadow-sm"
        >
          {TABS.map((item) => {
            const selected = tab.value === item.value;
            const count = counts?.[item.value];
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                // The tab lives in the address; switching goes back to page 1 (DEC-258).
                onClick={() =>
                  list.setFilters({ tab: item.value === DEFAULT_TAB ? null : item.value })
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
                      selected
                        ? "bg-primary-foreground/20"
                        : item.value === "overdue" && count > 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted",
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

      <DataTable
        columns={myTaskColumns}
        data={tasks.data?.items}
        getRowId={(row) => row.id}
        meta={tasks.data?.meta}
        isPending={tasks.isPending}
        isFetching={tasks.isFetching}
        error={tasks.error}
        onRetry={() => void tasks.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        // The task page's back link returns to this tab (DEC-292).
        onRowClick={(row) =>
          router.push(
            withFrom(`/tasks/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={tab.empty}
        emptyDescription="Tasks your manager gives you appear here."
      />
    </>
  );
}
