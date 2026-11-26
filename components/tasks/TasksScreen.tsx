"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { FilterToggle } from "@/components/common/FilterToggle";
import { PersonFilter } from "@/components/common/PersonFilter";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { taskColumns } from "@/components/tasks/taskColumns";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import type { PersonOption } from "@/hooks/data/usePeopleSearch";
import { useTaskCategories, useTaskList } from "@/hooks/tasks/useTasks";
import { useListParams } from "@/hooks/useListParams";
import { TASK_PRIORITY_LABELS, TASK_STATUS_FILTER_LABELS } from "@/lib/labels/task";
import { currentAddress, withFrom } from "@/lib/navigation/returnTo";

const FILTERS = [
  "status",
  "priority",
  "category",
  "assignedToId",
  "assignedById",
  "zoneId",
  "dueFrom",
  "dueTo",
  "overdue",
  "escalatedToMe",
] as const;

type PersonKey = "assignedToId" | "assignedById";

/**
 * Team tasks (`tasks.view`, DEC-286 – DEC-290): newest given first; search (title, doer or
 * giver name), status (one, or Unfinished), priority, category, doer, giver, zone, due
 * days, "Overdue only" and "Flagged to me". Admin and the Tasks Sub-Admin see every task,
 * a Zonal Head their zone's and their own (the server decides). A row opens the task.
 */
export function TasksScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useListParams({ defaultSort: "-createdAt", filters: FILTERS });
  const tasks = useTaskList(list.query);
  const categories = useTaskCategories();
  const canGive = useCan()("tasks.assign");
  const [giving, setGiving] = useState(false);
  // Names of the people chosen in the filters (a shared link only carries their ids).
  const [picked, setPicked] = useState<Partial<Record<PersonKey, PersonOption | null>>>({});

  const { status, priority, category, assignedToId, assignedById, zoneId } = list.filters;
  const { dueFrom, dueTo, overdue, escalatedToMe } = list.filters;
  const rows = tasks.data?.items;

  const categoryOptions = useMemo(() => {
    const options = Object.fromEntries((categories.data ?? []).map((name) => [name, name]));
    // A category from a link that isn't a suggestion still shows as chosen.
    if (category && !(category in options)) options[category] = category;
    return options;
  }, [categories.data, category]);

  const personLabel = (key: PersonKey, id: string | null) => {
    if (!id) return "";
    const known = picked[key]?.id === id ? picked[key] : null;
    if (known) return known.name ?? "Unnamed";
    const fromRows = rows
      ?.map((row) => (key === "assignedToId" ? row.assignedTo : row.assignedBy))
      .find((person) => person?.id === id)?.name;
    return fromRows ?? (key === "assignedToId" ? "One doer" : "One giver");
  };

  const pickPerson = (key: PersonKey, person: PersonOption | null) => {
    setPicked((current) => ({ ...current, [key]: person }));
    list.setFilters({ [key]: person?.id ?? null });
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Field tasks given to your team. The person doing a task starts and completes it with photos; overdue tasks are flagged to their manager every night."
        actions={
          canGive ? (
            <Button onClick={() => setGiving(true)}>
              <Plus data-icon="inline-start" />
              Give a task
            </Button>
          ) : undefined
        }
      />

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search title, doer or giver",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Status"
          value={status}
          onChange={(next) => list.setFilters({ status: next })}
          options={TASK_STATUS_FILTER_LABELS}
          allLabel="Any status"
          className="sm:w-40"
        />
        <FilterSelect
          label="Priority"
          value={priority}
          onChange={(next) => list.setFilters({ priority: next })}
          options={TASK_PRIORITY_LABELS}
          allLabel="Any priority"
          className="sm:w-40"
        />
        <FilterSelect
          label="Category"
          value={category}
          onChange={(next) => list.setFilters({ category: next })}
          options={categoryOptions}
          allLabel="Any category"
          className="sm:w-48"
        />
        <ZonePicker
          value={zoneId}
          onChange={(next) => list.setFilters({ zoneId: next })}
          className="sm:w-44"
        />
        <PersonFilter
          kind="staff"
          value={assignedToId}
          valueLabel={personLabel("assignedToId", assignedToId)}
          onChange={(person) => pickPerson("assignedToId", person)}
          zoneId={zoneId}
          placeholder="Any doer"
          className="sm:w-52"
        />
        <PersonFilter
          kind="staff"
          value={assignedById}
          valueLabel={personLabel("assignedById", assignedById)}
          onChange={(person) => pickPerson("assignedById", person)}
          zoneId={zoneId}
          placeholder="Any giver"
          className="sm:w-52"
        />
        <DateRangePicker
          value={{ from: dueFrom, to: dueTo }}
          onChange={(range) => list.setFilters({ dueFrom: range.from, dueTo: range.to })}
          placeholder="Due: any day"
          allowFuture
          className="sm:w-64"
        />
        <FilterToggle
          label="Overdue only"
          pressed={overdue === "true"}
          onPressedChange={(on) => list.setFilters({ overdue: on ? "true" : null })}
        />
        <FilterToggle
          label="Flagged to me"
          pressed={escalatedToMe === "true"}
          onPressedChange={(on) => list.setFilters({ escalatedToMe: on ? "true" : null })}
        />
      </DataTableToolbar>

      <DataTable
        columns={taskColumns}
        data={rows}
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
        // The details page's back link returns to this list with its filters (DEC-292).
        onRowClick={(row) =>
          router.push(
            withFrom(`/tasks/${row.id}`, currentAddress(pathname, searchParams.toString())),
          )
        }
        emptyTitle={list.isFiltered ? "No tasks match" : "No tasks yet"}
        emptyDescription={
          list.isFiltered
            ? "Try a different search or clear the filters."
            : "Tasks given to your team appear here."
        }
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />

      {giving ? (
        <TaskFormDialog task={null} open onOpenChange={(next) => !next && setGiving(false)} />
      ) : null}
    </>
  );
}
