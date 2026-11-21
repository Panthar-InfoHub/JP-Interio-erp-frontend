"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AddStaffDialog } from "@/components/staff/actions/AddStaffDialog";
import { useCan } from "@/hooks/auth/usePermission";
import { addableRoles } from "@/lib/staff/staffRules";

import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { staffColumns } from "@/components/staff/staffColumns";
import { Button } from "@/components/ui/button";
import { useStaffList } from "@/hooks/staff/useStaff";
import { useListParams } from "@/hooks/useListParams";
import { STAFF_ROLE_LABELS, STAFF_STATUS, ZONE_ROLE_LABELS } from "@/lib/labels/staff";
import { useAuthStore } from "@/stores/auth.store";

const FILTERS = ["role", "zoneId", "status", "managerId"] as const;

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(STAFF_STATUS).map(([value, { label }]) => [value, label]),
);

/**
 * Staff (`users.view`, DEC-261): Admin sees everyone; a Zonal Head their zone (the server
 * decides). A → Z by default, deactivated included unless filtered. `managerId` (one
 * manager's direct team) comes only from links on the staff details page.
 */
export function StaffScreen() {
  const router = useRouter();
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const list = useListParams({ defaultSort: "name", filters: FILTERS });
  const staff = useStaffList(list.query);
  const can = useCan();
  const myRole = useAuthStore((state) => state.user?.role.key);
  const roles = addableRoles(myRole, can);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title="Staff"
        description={
          isZonalHead
            ? "Everyone in your zone: you, your ASMs and their Sales Executives."
            : "Everyone who works for the company. Partners are under Partners."
        }
        actions={
          roles.length > 0 ? (
            <Button onClick={() => setAdding(true)}>
              <Plus data-icon="inline-start" />
              Add staff
            </Button>
          ) : undefined
        }
      />
      {adding ? (
        <AddStaffDialog roles={roles} open onOpenChange={(next) => !next && setAdding(false)} />
      ) : null}

      <DataTableToolbar
        search={{
          value: list.search,
          onChange: list.setSearch,
          placeholder: "Search name, mobile or email",
        }}
        isFiltered={list.isFiltered}
        onClear={() => list.clearFilters()}
      >
        <FilterSelect
          label="Role"
          value={list.filters.role}
          onChange={(role) => list.setFilters({ role })}
          options={isZonalHead ? ZONE_ROLE_LABELS : STAFF_ROLE_LABELS}
          allLabel="All roles"
        />
        {!isZonalHead ? (
          <ZonePicker
            value={list.filters.zoneId}
            onChange={(zoneId) => list.setFilters({ zoneId })}
            className="sm:w-44"
          />
        ) : null}
        <FilterSelect
          label="Status"
          value={list.filters.status}
          onChange={(status) => list.setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
        {list.filters.managerId ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => list.setFilters({ managerId: null })}
            className="self-start sm:self-auto"
          >
            One manager&apos;s team
            <X data-icon="inline-end" aria-label="Remove this filter" />
          </Button>
        ) : null}
      </DataTableToolbar>

      <DataTable
        columns={staffColumns}
        data={staff.data?.items}
        getRowId={(row) => row.id}
        meta={staff.data?.meta}
        isPending={staff.isPending}
        isFetching={staff.isFetching}
        error={staff.error}
        onRetry={() => void staff.refetch()}
        sort={list.sort}
        onSortChange={list.setSort}
        onPageChange={list.setPage}
        onLimitChange={list.setLimit}
        onRowClick={(row) => router.push(`/staff/${row.id}`)}
        emptyTitle={list.isFiltered ? "No staff match" : "No staff yet"}
        emptyDescription={
          list.isFiltered ? "Try a different search or clear the filters." : undefined
        }
        emptyAction={
          list.isFiltered ? (
            <Button variant="outline" size="sm" onClick={() => list.clearFilters()}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
