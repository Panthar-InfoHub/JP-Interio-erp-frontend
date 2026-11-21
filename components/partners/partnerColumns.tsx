import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { ACCOUNT_STATUS, partnerTypeLabel } from "@/lib/labels/partner";
import type { PartnerListItem } from "@/types/partner";

const col = createColumns<PartnerListItem>();

/** Partners list columns (defined once, as TanStack Table needs stable columns). */
export const partnerColumns = col.columns([
  col.accessor((row) => row.name, {
    id: "partner",
    header: "Partner",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.name ?? "—"}</p>
          {row.businessName ? (
            <p className="truncate text-xs text-muted-foreground">{row.businessName}</p>
          ) : null}
        </div>
      );
    },
    meta: { sortField: "name", primary: true },
  }),
  col.accessor("phone", {
    header: "Mobile",
    cell: (info) => <span className="whitespace-nowrap">{formatPhone(info.getValue())}</span>,
  }),
  col.accessor("partnerType", {
    header: "Type",
    cell: (info) => partnerTypeLabel(info.getValue()),
  }),
  col.accessor((row) => row.zone?.name ?? "—", {
    id: "zone",
    header: "Zone",
  }),
  col.accessor((row) => row.asm?.name ?? "—", {
    id: "owner",
    header: "ASM / Sales Exec",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate">{row.asm?.name ?? "—"}</p>
          {row.salesExecutive ? (
            <p className="truncate text-xs text-muted-foreground">{row.salesExecutive.name}</p>
          ) : null}
        </div>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = ACCOUNT_STATUS[info.getValue()];
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("joinedAt", {
    header: "Joined",
    cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc" },
  }),
]);
