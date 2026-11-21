"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DayPicker } from "@/components/common/DayPicker";
import { ErrorState } from "@/components/common/StateMessages";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLiability } from "@/hooks/ledger/useLedger";
import { formatDateTime } from "@/lib/format/date";
import { istDayEnd } from "@/lib/format/istDay";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * What we owe partners = available + held (DEC-136), Admin and the Rewards Sub-Admin
 * (DEC-205). Opens at "now"; a picked day shows it as at the end of that India day
 * (DEC-256), kept in the address as `?day=`. Total cards + one row per zone.
 */
export function PointsLiabilityScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawDay = searchParams.get("day");
  const day = rawDay && DAY.test(rawDay) ? rawDay : null;
  const report = useLiability(day ? istDayEnd(day) : null);

  const setDay = (next: string | null) =>
    router.replace(next ? `${pathname}?day=${next}` : pathname, { scroll: false });

  return (
    <>
      <PageHeader
        title="Points liability"
        description="What JP Interio owes partners: points available plus points held in cash-out requests (1 point = ₹1)."
        actions={
          <DayPicker
            value={day}
            onChange={setDay}
            placeholder="As of now"
            className="w-full sm:w-56"
          />
        }
      />

      {report.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the report">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : report.isError ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <ErrorState error={report.error} onRetry={() => void report.refetch()} />
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            As at <strong className="text-foreground">{formatDateTime(report.data.asOf)}</strong>
            {day ? " (end of that day, India time)" : " (now)"}
          </p>

          <section aria-label="Totals" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Owed in total"
              value={formatRupees(report.data.total.owedRupees)}
              hint={formatPoints(report.data.total.owed)}
            />
            <StatCard label="Available" value={formatPoints(report.data.total.available)} />
            <StatCard label="Held in cash-outs" value={formatPoints(report.data.total.held)} />
            <StatCard
              label="Partners with points"
              value={formatCount(report.data.total.partnersWithPoints)}
              hint={`Of which frozen: ${formatRupees(report.data.total.frozenRupees)}`}
            />
          </section>

          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead className="text-right">Partners</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Held</TableHead>
                    <TableHead className="text-right">Owed</TableHead>
                    <TableHead className="text-right">Of which frozen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.data.zones.map((row) => (
                    <TableRow key={row.zone?.id ?? "no-zone"}>
                      <TableCell>
                        <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold">
                          {row.zone?.name ?? "No zone"}
                          {row.zone?.status === "inactive" ? (
                            <StatusBadge tone="neutral">Inactive</StatusBadge>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(row.partnersWithPoints)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(row.available)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(row.held)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatRupees(row.owedRupees)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatRupees(row.frozenRupees)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(report.data.total.partnersWithPoints)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(report.data.total.available)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(report.data.total.held)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatRupees(report.data.total.owedRupees)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupees(report.data.total.frozenRupees)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{report.data.note}</p>
        </>
      )}
    </>
  );
}
