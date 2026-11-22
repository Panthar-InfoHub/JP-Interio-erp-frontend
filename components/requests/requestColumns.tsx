import { createColumns } from "@/components/data-table/columns";
import { RequestPartnerCell } from "@/components/requests/RequestPartnerCell";
import { RequestStageBadge } from "@/components/requests/RequestStageBadge";
import type { RequestListRow } from "@/lib/api/requests.api";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { formatCount, formatRupees } from "@/lib/format/number";
import { HANDLER_ROLE_LABELS, REQUEST_KIND_LABELS } from "@/lib/labels/request";

const col = createColumns<RequestListRow>();

/**
 * Request list columns (stable, defined once, DEC-281): the Requests page and, without
 * Partner and Zone, the Partner 360 tab (DEC-283). A row opens the request.
 */
export const requestColumns = col.columns([
  col.accessor("requestNo", {
    header: "Request",
    cell: (info) => (
      <div className="whitespace-nowrap">
        <p className="font-semibold">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(info.row.original.createdAt)}
        </p>
      </div>
    ),
    meta: { sortField: "createdAt", firstSort: "desc", primary: true },
  }),
  col.accessor((row) => row.partner.name, {
    id: "partner",
    header: "Partner",
    cell: (info) => <RequestPartnerCell partner={info.row.original.partner} />,
  }),
  col.accessor("category", {
    header: "Kind",
    cell: (info) => REQUEST_KIND_LABELS[info.getValue()] ?? info.getValue(),
  }),
  col.accessor("status", {
    header: "Stage",
    cell: (info) => (
      <RequestStageBadge status={info.getValue()} refundDue={info.row.original.refundDue} />
    ),
  }),
  col.accessor((row) => row.handler.name, {
    id: "handler",
    header: "Handler",
    cell: (info) => {
      const handler = info.row.original.handler;
      return (
        <div className="min-w-0">
          <p className="truncate">{handler.name ?? "Unnamed"}</p>
          <p className="text-xs text-muted-foreground">
            {HANDLER_ROLE_LABELS[handler.role] ?? handler.role}
          </p>
        </div>
      );
    },
  }),
  col.accessor((row) => row.zone?.name ?? "—", { id: "zone", header: "Zone" }),
  col.accessor("itemCount", {
    header: "Items",
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
    meta: { align: "end" },
  }),
  col.accessor("agreedAmount", {
    header: "Agreed price",
    cell: (info) => (
      <span className="whitespace-nowrap tabular-nums">
        {info.getValue() ? formatRupees(info.getValue()) : "—"}
      </span>
    ),
    meta: { align: "end" },
  }),
  col.accessor("preferredDeliveryDate", {
    header: "Wanted by",
    cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
  }),
  col.accessor("updatedAt", {
    header: "Last change",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "updatedAt", firstSort: "desc", hideOnMobile: true },
  }),
]);

/** The same for a Zonal Head: every row is their zone, so no Zone column (DEC-281). */
export const requestColumnsWithoutZone = requestColumns.filter((column) => column.id !== "zone");

/**
 * One partner's requests (Partner 360 tab, DEC-283): no Partner, no Zone. That list sorts
 * by "made" only, so "Last change" is shown but not sortable there.
 */
export const partnerRequestColumns = requestColumns
  .filter((column) => column.id !== "zone" && column.id !== "partner")
  .map((column) =>
    column.id === "updatedAt"
      ? { ...column, meta: { ...column.meta, sortField: undefined } }
      : column,
  );
