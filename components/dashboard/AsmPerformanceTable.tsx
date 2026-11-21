"use client";

import { createColumns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/DataTable";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";
import type { AsmPerformanceRow } from "@/types/dashboard";

const col = createColumns<AsmPerformanceRow>();

// Defined once at module level, as TanStack Table needs stable columns.
const columns = col.columns([
  col.accessor((row) => row.asm.name, {
    id: "asm",
    header: "ASM",
    meta: { primary: true },
  }),
  col.accessor("partnersOnboarded", {
    header: "New partners",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor("activePartners", {
    header: "Active",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor("dormantPartners", {
    header: "Dormant",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor("scans", {
    header: "Scans",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor("points", {
    header: "Points",
    cell: (info) => formatPoints(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor((row) => row.requests.open, {
    id: "openRequests",
    header: "Open requests",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor((row) => row.requests.pipelineValue, {
    id: "pipeline",
    header: "Open order value",
    cell: (info) => formatRupees(info.getValue()),
    meta: { align: "end" },
  }),
  col.accessor((row) => row.tasks, {
    id: "tasks",
    header: "Tasks done / on time / overdue",
    cell: (info) => {
      const tasks = info.getValue();
      return `${formatCount(tasks.completed)} / ${formatCount(tasks.onTime)} / ${formatCount(tasks.overdue)}`;
    },
    meta: { align: "end", label: "Tasks (done / on time / overdue)" },
  }),
  col.accessor("salesExecutives", {
    header: "Sales Execs",
    cell: (info) => formatCount(info.getValue()),
    meta: { align: "end" },
  }),
]);

/** Zonal Head: one row per active ASM in their zone (A → Z), numbers for the period. */
export function AsmPerformanceTable({ rows }: { rows: AsmPerformanceRow[] }) {
  return (
    <section className="flex flex-col gap-3" aria-label="ASM performance">
      <div>
        <h2 className="text-base">ASM performance</h2>
        <p className="text-xs text-muted-foreground">
          Every active ASM in your zone, for the chosen period. Tasks include their Sales
          Executives.
        </p>
      </div>
      {/* Many columns: on narrower screens the table scrolls sideways (shadcn's table
          container), on phones it becomes cards. */}
      <div className="[&_table]:min-w-[56rem]">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.asm.id}
          isPending={false}
          emptyTitle="No active ASMs in your zone"
        />
      </div>
    </section>
  );
}
