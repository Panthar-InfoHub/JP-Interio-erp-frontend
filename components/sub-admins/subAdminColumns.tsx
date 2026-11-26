import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { SubAdminAreasButton } from "@/components/sub-admins/SubAdminAreasButton";
import type { SubAdmin } from "@/lib/api/subAdmins.api";
import { areaLabel } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { STAFF_STATUS } from "@/lib/labels/staff";

const col = createColumns<SubAdmin>();

/**
 * Sub-Admins list columns (stable, DEC-302). The server sends the whole list oldest first,
 * so nothing sorts. A row opens the staff page; "Edit areas" doesn't.
 */
export const subAdminColumns = col.columns([
  col.accessor("name", {
    header: "Name",
    cell: (info) => <span className="font-semibold">{info.getValue() ?? "Unnamed"}</span>,
    meta: { primary: true },
  }),
  col.accessor("phone", {
    header: "Mobile",
    cell: (info) => <span className="whitespace-nowrap">{formatPhone(info.getValue())}</span>,
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = STAFF_STATUS[info.getValue()];
      return status ? (
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      ) : (
        info.getValue()
      );
    },
  }),
  col.accessor("areas", {
    header: "Areas",
    cell: (info) =>
      info.getValue().length === 0 ? (
        <span className="text-muted-foreground">No areas</span>
      ) : (
        <span className="flex flex-wrap gap-1.5">
          {info.getValue().map((area) => (
            <StatusBadge key={area} tone="info">
              {areaLabel(area)}
            </StatusBadge>
          ))}
        </span>
      ),
  }),
  col.accessor("createdAt", {
    header: "Added on",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { hideOnMobile: true },
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (info) => <SubAdminAreasButton subAdmin={info.row.original} />,
    meta: { label: "Actions" },
  }),
]);
