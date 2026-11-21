import Link from "next/link";

import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { ZoneRowActions } from "@/components/zones/ZoneRowActions";
import type { Zone } from "@/lib/api/zones.api";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { ZONE_STATUS } from "@/lib/labels/zone";

const col = createColumns<Zone>();

/** Zones list columns (stable, defined once). No details page: actions sit on the row. */
export const zoneColumns = col.columns([
  col.accessor("name", {
    header: "Zone",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.code}</p>
        </div>
      );
    },
    meta: { sortField: "name", primary: true },
  }),
  col.accessor((row) => [row.region, row.state].filter(Boolean).join(", ") || "—", {
    id: "place",
    header: "Region / State",
  }),
  col.accessor((row) => row.zonalHead?.name ?? null, {
    id: "zonalHead",
    header: "Zonal Head",
    cell: (info) => {
      const head = info.row.original.zonalHead;
      if (!head) return <StatusBadge tone="warning">No Zonal Head</StatusBadge>;
      return (
        <div className="min-w-0">
          <Link
            href={`/staff/${head.id}`}
            className="block truncate font-semibold text-primary hover:underline"
          >
            {head.name ?? "Unnamed"}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{formatPhone(head.phone)}</p>
        </div>
      );
    },
  }),
  col.accessor((row) => row.counts?.asms ?? 0, {
    id: "people",
    header: "People",
    cell: (info) => {
      const row = info.row.original;
      const counts = row.counts;
      // Opens the Staff list filtered to this zone (DEC-261).
      return (
        <Link
          href={`/staff?zoneId=${row.id}`}
          className="whitespace-nowrap text-muted-foreground hover:underline"
          title="Open this zone's staff"
        >
          <span className="font-semibold text-foreground">{counts?.asms ?? 0}</span> ASMs ·{" "}
          <span className="font-semibold text-foreground">{counts?.salesExecutives ?? 0}</span> SEs
          · <span className="font-semibold text-foreground">{counts?.partners ?? 0}</span> partners
        </Link>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = ZONE_STATUS[info.getValue() ?? "active"];
      return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
    },
  }),
  col.accessor("createdAt", {
    header: "Added",
    cell: (info) => <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>,
    meta: { sortField: "createdAt", firstSort: "desc", hideOnMobile: true },
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (info) => <ZoneRowActions zone={info.row.original} />,
    meta: { label: "Actions" },
  }),
]);
