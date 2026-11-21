"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { dashboardApi } from "@/lib/api/dashboard.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type { AsmRanking, DashboardPeriodKey } from "@/types/dashboard";

const PERIODS: readonly DashboardPeriodKey[] = ["today", "month", "all"];
const RANKINGS: readonly AsmRanking[] = ["points", "scans", "newPartners"];

/**
 * Period and ASM ranking, kept in the page address (DEC-236): `?period=today&rank=scans`.
 * Defaults (this month, by points) are left out of the address.
 * Uses useSearchParams: the page needs a <Suspense> boundary.
 */
export function useDashboardParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPeriod = searchParams.get("period") as DashboardPeriodKey | null;
  const rawRank = searchParams.get("rank") as AsmRanking | null;
  const period: DashboardPeriodKey = rawPeriod && PERIODS.includes(rawPeriod) ? rawPeriod : "month";
  const rankAsmsBy: AsmRanking = rawRank && RANKINGS.includes(rawRank) ? rawRank : "points";

  const update = useCallback(
    (key: "period" | "rank", value: string, fallback: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === fallback) next.delete(key);
      else next.set(key, value);
      const text = next.toString();
      router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return {
    period,
    rankAsmsBy,
    setPeriod: (value: DashboardPeriodKey) => update("period", value, "month"),
    setRankAsmsBy: (value: AsmRanking) => update("rank", value, "points"),
  };
}

/**
 * The dashboard numbers. Loaded when the page opens and on "Refresh" only (DEC-236):
 * no polling, no refetch on window focus. Switching period keeps the old numbers on
 * screen (dimmed) until the new ones arrive.
 */
export function useDashboard(period: DashboardPeriodKey, rankAsmsBy: AsmRanking) {
  return useQuery({
    queryKey: queryKeys.dashboard.view(period, rankAsmsBy),
    queryFn: () => dashboardApi.get({ period, rankAsmsBy }),
    placeholderData: keepPreviousData,
  });
}
