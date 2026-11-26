import { KYC_STATE, PARTNER_TYPE_LABELS } from "@/lib/labels/partner";
import { PAYOUT_STATUS } from "@/lib/labels/payout";
import { REQUEST_KIND_LABELS, REQUEST_STAGE } from "@/lib/labels/request";
import { TASK_STATUS } from "@/lib/labels/task";
import type { Me, SubAdminArea } from "@/types/auth";

/**
 * The 8 CSV reports (docs/api/reports.openapi.yaml, DEC-224, DEC-299). `areas` copies the
 * server's REPORT_AREAS (backend reportExport.service.ts) to show only the reports a
 * Sub-Admin may download; the server checks again (R1).
 */

export interface ReportFilter {
  /** The query name the API takes. */
  name: string;
  label: string;
  allLabel: string;
  options: Record<string, string>;
}

export interface ReportDefinition {
  key: string;
  title: string;
  /** What one line of the file is. */
  oneRow: string;
  /** What the dates filter on. */
  datesMean: string;
  /** The date picker's words when nothing is picked (= the server's default). */
  noDates: string;
  areas: readonly SubAdminArea[];
  filters: readonly ReportFilter[];
}

const labelsOf = <K extends string>(
  table: Record<K, { label: string }>,
  keys: readonly K[],
): Record<string, string> => Object.fromEntries(keys.map((key) => [key, table[key].label]));

export const REPORTS: readonly ReportDefinition[] = [
  {
    key: "scans",
    title: "Scans",
    oneRow: "One line per scan: partner, product, batch, code, points, zone and ASM at scan time.",
    datesMean: "Scan time",
    noDates: "This month",
    areas: ["rewards", "qr"],
    filters: [],
  },
  {
    key: "points-issued",
    title: "Points issued",
    oneRow: "One line per partner with their scans and points in the period, highest first.",
    datesMean: "Scan time",
    noDates: "This month",
    areas: ["rewards"],
    filters: [],
  },
  {
    key: "payouts",
    title: "Payouts",
    oneRow:
      "One line per payout with the account (in full), who approved / paid / declined it and when.",
    datesMean: "Request time",
    noDates: "This month",
    areas: ["rewards"],
    filters: [
      {
        name: "status",
        label: "Status",
        allLabel: "Any status",
        options: labelsOf(PAYOUT_STATUS, ["requested", "approved", "paid", "declined", "failed"]),
      },
    ],
  },
  {
    key: "partners",
    title: "Partners",
    oneRow:
      "One line per partner who finished sign-up: details, KYC, numbers in full (Aadhaar last 4), default account, wallet.",
    datesMean: "Joined",
    noDates: "All partners",
    areas: ["partners"],
    filters: [
      {
        name: "kycState",
        label: "KYC",
        allLabel: "Any KYC state",
        options: labelsOf(KYC_STATE, ["not_submitted", "pending", "verified", "rejected"]),
      },
      {
        name: "activity",
        label: "Activity",
        allLabel: "Any activity",
        options: { active: "Active", dormant: "Dormant", suspended: "Suspended" },
      },
      {
        name: "partnerType",
        label: "Type",
        allLabel: "Any type",
        options: PARTNER_TYPE_LABELS,
      },
    ],
  },
  {
    key: "products",
    title: "Products",
    oneRow:
      "One line per product (even with 0 scans): brand, category, MRP, scans and points given.",
    datesMean: "Scan time",
    noDates: "This month",
    areas: ["products"],
    filters: [],
  },
  {
    key: "regions",
    title: "Regions",
    oneRow: "One line per zone: partners now, scans and points, payouts paid, open requests.",
    datesMean: "Scan time / paid time",
    noDates: "This month",
    areas: ["partners"],
    filters: [],
  },
  {
    key: "tasks",
    title: "Tasks",
    oneRow: "One line per task: giver, doer, zone, due day, started / completed, overdue, on time.",
    datesMean: "Given time",
    noDates: "This month",
    areas: ["tasks"],
    filters: [
      {
        name: "status",
        label: "Status",
        allLabel: "Any status",
        options: labelsOf(TASK_STATUS, ["open", "in_progress", "completed", "cancelled"]),
      },
    ],
  },
  {
    key: "requests",
    title: "Requests",
    oneRow:
      "One line per shipment / sample request: products, stage, price, handler, payment and refund.",
    datesMean: "Request time",
    noDates: "This month",
    areas: ["requests"],
    filters: [
      {
        name: "stage",
        label: "Stage",
        allLabel: "Any stage",
        options: labelsOf(REQUEST_STAGE, [
          "requested",
          "accepted",
          "rejected",
          "payment_received",
          "processing",
          "dispatched",
          "delivered",
          "completed",
          "cancelled",
          "refund_initiated",
          "refunded",
        ]),
      },
      {
        name: "type",
        label: "Kind",
        allLabel: "Shipments and samples",
        options: REQUEST_KIND_LABELS,
      },
    ],
  },
];

/**
 * The reports this person may download (DEC-299): Admin and Zonal Heads all 8; a Sub-Admin
 * only their areas' reports; anyone else none. Needs `reports.view` (checked by the caller).
 */
export function reportsFor(user: Pick<Me, "role" | "subAdminAreas"> | null) {
  if (!user) return [];
  const role = user.role.key;
  if (role === "admin" || role === "zonal_head") return REPORTS;
  if (role === "sub_admin") {
    return REPORTS.filter((report) =>
      report.areas.some((area) => user.subAdminAreas.includes(area)),
    );
  }
  return [];
}
