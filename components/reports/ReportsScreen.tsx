"use client";

import { FileSpreadsheet } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ReportCard } from "@/components/reports/ReportCard";
import { reportsFor } from "@/lib/reports/reportCatalog";
import { useAuthStore } from "@/stores/auth.store";

/**
 * CSV reports (`reports.view`: Admin all, Sub-Admin their areas, Zonal Head their zone,
 * DEC-214, DEC-299): one card per report I may download. Files open in Excel (India times,
 * numbers in full, Aadhaar last 4). Every download is logged on the server.
 */
export function ReportsScreen() {
  const user = useAuthStore((state) => state.user);
  const reports = reportsFor(user);
  const isZonalHead = user?.role.key === "zonal_head";

  return (
    <>
      <PageHeader
        title="Reports"
        description={
          isZonalHead
            ? "Download CSV files for your zone. They open in Excel, with India times."
            : "Download CSV files. They open in Excel, with India times. Every download is logged."
        }
      />

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-10 text-center shadow-sm">
          <FileSpreadsheet className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-semibold">No reports for your areas</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Reports come with the Partners, Rewards, QR, Products, Tasks and Requests areas. Ask the
            Admin if you need one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.key} report={report} />
          ))}
        </div>
      )}
    </>
  );
}
