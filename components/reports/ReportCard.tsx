"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { DateRangePicker, type DayRange } from "@/components/common/DateRangePicker";
import { FilterSelect } from "@/components/common/FilterSelect";
import { ZonePicker } from "@/components/common/ZonePicker";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFileDownload } from "@/hooks/files/useFileDownload";
import type { ReportDefinition } from "@/lib/reports/reportCatalog";

/**
 * One CSV report (DEC-224, DEC-299): what a line is, its filters (kept only while the page
 * is open), and Download. Empty dates = the server's default ("This month"; Partners: all).
 * The zone picker is fixed to a Zonal Head's own zone (the server forces it anyway). The file
 * keeps the server's name; the message shows the row count. Every download is logged.
 */
export function ReportCard({ report }: { report: ReportDefinition }) {
  const download = useFileDownload();
  const [dates, setDates] = useState<DayRange>({ from: null, to: null });
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, string | null>>({});

  const start = () =>
    download.mutate({
      path: `/reports/${report.key}.csv`,
      params: { from: dates.from, to: dates.to, zoneId, ...extra },
      fallbackName: `${report.key}.csv`,
    });

  return (
    <section
      aria-label={report.title}
      className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileSpreadsheet className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base">{report.title}</h2>
          <p className="text-sm text-muted-foreground">{report.oneRow}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Dates: {report.datesMean}</span>
          <DateRangePicker
            value={dates}
            onChange={setDates}
            placeholder={report.noDates}
            className="w-full"
          />
        </div>
        <ZonePicker value={zoneId} onChange={setZoneId} className="w-full" />
        {report.filters.map((filter) => (
          <FilterSelect
            key={filter.name}
            label={filter.label}
            value={extra[filter.name] ?? null}
            onChange={(next) => setExtra((current) => ({ ...current, [filter.name]: next }))}
            options={filter.options}
            allLabel={filter.allLabel}
            className="w-full"
          />
        ))}
      </div>

      <Button className="mt-auto self-start" disabled={download.isPending} onClick={start}>
        {download.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Download data-icon="inline-start" />
        )}
        {download.isPending ? "Preparing…" : "Download CSV"}
      </Button>
    </section>
  );
}
