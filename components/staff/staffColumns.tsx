import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { STAFF_STATUS } from "@/lib/labels/staff";
import type { Staff } from "@/types/staff";

const col = createColumns<Staff>();

/** Staff list columns (stable, defined once). A row opens the staff details page. */
export const staffColumns = col.columns([
  col.accessor((row) => row.name, {
    id: "name",
    header: "Name",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.name ?? "Unnamed"}</p>
          {row.email ? <p className="truncate text-xs text-muted-foreground">{row.email}</p> : null}
        </div>
      );
    },
    meta: { sortField: "name", primary: true },
  }),
  col.accessor("phone", {
    header: "Mobile",
    cell: (info) => <span className="whitespace-nowrap">{formatPhone(info.getValue())}</span>,
  }),
  col.accessor((row) => row.role.name, {
    id: "role",
    header: "Role",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate">{row.role.name}</p>
          {row.role.key === "sub_admin" ? (
            <p className="truncate text-xs text-muted-foreground">
              {row.areas.length === 0 ? "No areas" : `${row.areas.length} area(s)`}
            </p>
          ) : null}
        </div>
      );
    },
  }),
  col.accessor((row) => row.zone?.name ?? "—", { id: "zone", header: "Zone" }),
  col.accessor((row) => row.parent?.name ?? "—", {
    id: "manager",
    header: "Reports to",
    cell: (info) => {
      const parent = info.row.original.parent;
      if (!parent) return "—";
      return (
        <div className="min-w-0">
          <p className="truncate">{parent.name ?? "Unnamed"}</p>
          <p className="truncate text-xs text-muted-foreground">{parent.role.name}</p>
        </div>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = STAFF_STATUS[info.getValue()];
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("createdAt", {
    header: "Added",
    cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc", hideOnMobile: true },
  }),
]);
