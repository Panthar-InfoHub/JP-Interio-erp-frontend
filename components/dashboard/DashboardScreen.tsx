"use client";

import { RefreshCw } from "lucide-react";

import { ErrorState } from "@/components/common/StateMessages";
import { PeriodSwitch } from "@/components/dashboard/PeriodSwitch";
import {
  AdminDashboardView,
  SubAdminDashboardView,
  ZonalHeadDashboardView,
} from "@/components/dashboard/views";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, useDashboardParams } from "@/hooks/dashboard/useDashboard";
import { formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading the dashboard">
      {[0, 1, 2].map((section) => (
        <div key={section} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The home page for every web role. One call (`GET /dashboard`); the server sends the
 * cards for this person (Admin: company, Sub-Admin: their areas, Zonal Head: their zone).
 */
export function DashboardScreen() {
  const name = useAuthStore((state) => state.user?.name);
  const { period, rankAsmsBy, setPeriod, setRankAsmsBy } = useDashboardParams();
  const dashboard = useDashboard(period, rankAsmsBy);
  const data = dashboard.data;

  const header = (
    <PageHeader
      title={name ? `Welcome, ${name}` : "Dashboard"}
      description={
        data ? `Numbers as of ${formatDateTime(data.period.to)}` : "Your numbers at a glance."
      }
      actions={
        <>
          <PeriodSwitch value={period} onChange={setPeriod} />
          <Button
            variant="outline"
            onClick={() => void dashboard.refetch()}
            disabled={dashboard.isFetching}
            aria-label="Refresh the numbers"
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(dashboard.isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </>
      }
    />
  );

  if (!data) {
    return (
      <>
        {header}
        {dashboard.isError ? (
          <div className="rounded-xl border bg-card shadow-sm">
            <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
          </div>
        ) : (
          <DashboardSkeleton />
        )}
      </>
    );
  }

  const rankProps = { rankAsmsBy, onRankChange: setRankAsmsBy };

  return (
    <>
      {header}
      <div
        className={cn("transition-opacity", dashboard.isPlaceholderData && "opacity-60")}
        aria-busy={dashboard.isFetching}
      >
        {data.role === "admin" ? (
          <AdminDashboardView data={data} {...rankProps} />
        ) : data.role === "sub_admin" ? (
          <SubAdminDashboardView data={data} />
        ) : data.role === "zonal_head" ? (
          <ZonalHeadDashboardView data={data} {...rankProps} />
        ) : null}
      </div>
    </>
  );
}
