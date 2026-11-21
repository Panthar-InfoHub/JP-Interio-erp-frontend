import { StatusBadge } from "@/components/common/StatusBadge";
import { createColumns } from "@/components/data-table/columns";
import { formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { partnerTypeLabel } from "@/lib/labels/partner";
import type { KycQueueItem } from "@/types/kyc";

const col = createColumns<KycQueueItem>();

/** KYC queue columns (stable, defined once). */
export const kycColumns = col.columns([
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
    meta: { primary: true },
  }),
  col.accessor("phone", {
    header: "Mobile",
    cell: (info) => <span className="whitespace-nowrap">{formatPhone(info.getValue())}</span>,
  }),
  col.accessor("partnerType", {
    header: "Type",
    cell: (info) => partnerTypeLabel(info.getValue()),
  }),
  col.accessor((row) => row.zone?.name ?? "—", { id: "zone", header: "Zone" }),
  col.accessor((row) => row.startedBy, {
    id: "signedUp",
    header: "Signed up by",
    cell: (info) => {
      const row = info.row.original;
      if (!row.startedBy) {
        return (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            Self sign-up
            {row.needsAsmPick && row.kycState === "pending" ? (
              <StatusBadge tone="info">Pick an ASM</StatusBadge>
            ) : null}
          </span>
        );
      }
      return `${row.startedBy.name ?? "—"} (${row.startedBy.role ?? "staff"})`;
    },
  }),
  col.accessor("submittedAt", {
    header: "Submitted",
    cell: (info) => <span className="whitespace-nowrap">{formatDateTime(info.getValue())}</span>,
    meta: { sortField: "submittedAt" },
  }),
]);

/** Extra column on the Rejected / Verified tabs: when it was decided (and why, if rejected). */
export const kycReviewedColumns = col.columns([
  ...kycColumns,
  col.accessor("reviewedAt", {
    header: "Reviewed",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="min-w-0">
          <p className="whitespace-nowrap">{formatDateTime(info.getValue())}</p>
          {row.rejectionReason ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{row.rejectionReason}</p>
          ) : null}
        </div>
      );
    },
  }),
]);
