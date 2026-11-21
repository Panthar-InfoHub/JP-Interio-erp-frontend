"use client";

import { ShieldQuestion } from "lucide-react";

import { NoZoneMessage } from "@/components/common/NoZoneMessage";
import { AsmPerformanceTable } from "@/components/dashboard/AsmPerformanceTable";
import { LeaderboardsSection } from "@/components/dashboard/LeaderboardsSection";
import { inPeriod } from "@/components/dashboard/periodText";
import {
  LiabilitySection,
  PartnersSection,
  PayoutsSection,
  QrSection,
  RequestsSection,
  ScansSection,
  TasksSection,
  ZonePayoutsSection,
} from "@/components/dashboard/sections";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatSection } from "@/components/dashboard/StatSection";
import { TopProductsList } from "@/components/dashboard/TopProductsList";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";
import type {
  AdminDashboard,
  AsmRanking,
  SubAdminDashboard,
  ZonalHeadDashboard,
} from "@/types/dashboard";

interface RankProps {
  rankAsmsBy: AsmRanking;
  onRankChange: (ranking: AsmRanking) => void;
}

const ROLE_ORDER = ["admin", "sub_admin", "zonal_head", "asm", "sales_executive"] as const;
const ROLE_NAMES: Record<string, string> = {
  admin: "Admin",
  sub_admin: "Sub-Admins",
  zonal_head: "Zonal Heads",
  asm: "ASMs",
  sales_executive: "Sales Executives",
};

/** Admin: the whole company. */
export function AdminDashboardView({
  data,
  rankAsmsBy,
  onRankChange,
}: { data: AdminDashboard } & RankProps) {
  const { cards, period } = data;
  return (
    <div className="flex flex-col gap-8">
      <LeaderboardsSection
        boards={cards.leaderboards}
        rankAsmsBy={rankAsmsBy}
        onRankChange={onRankChange}
      />
      <PartnersSection cards={cards.partners} period={period.key} dormantDays={data.dormantDays} />
      <ScansSection cards={cards.scans} period={period.key} />
      <PayoutsSection cards={cards.payouts} period={period.key} />
      <LiabilitySection cards={cards.pointsLiability} />
      <RequestsSection cards={cards.requests} period={period.key} />
      <TasksSection cards={cards.tasks} period={period.key} />
      <StatSection title="Support tickets">
        <StatCard
          label="Open"
          value={formatCount(cards.tickets.open)}
          hint="now"
          attention={cards.tickets.open > 0}
        />
        <StatCard label="In progress" value={formatCount(cards.tickets.inProgress)} hint="now" />
      </StatSection>
      <StatSection title="Staff" description="Active staff now.">
        <StatCard label="All staff" value={formatCount(cards.staff.total)} />
        {ROLE_ORDER.map((role) => (
          <StatCard
            key={role}
            label={ROLE_NAMES[role] ?? role}
            value={formatCount(cards.staff.byRole[role] ?? 0)}
          />
        ))}
      </StatSection>
    </div>
  );
}

/** Sub-Admin: one block per area they hold (the server sends only those, DEC-200). */
export function SubAdminDashboardView({ data }: { data: SubAdminDashboard }) {
  const { cards, period, areas } = data;

  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-14 text-center shadow-sm">
        <ShieldQuestion className="size-8 text-muted-foreground" aria-hidden />
        <p className="font-semibold">You don&apos;t have any areas yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ask the Admin to give you one (for example Partners &amp; KYC or Rewards &amp; Payouts).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {cards.partners ? (
        <PartnersSection
          cards={cards.partners}
          period={period.key}
          dormantDays={data.dormantDays}
        />
      ) : null}

      {cards.rewards ? (
        <>
          <PayoutsSection cards={cards.rewards.payouts} period={period.key} />
          <StatSection title="Points">
            <StatCard
              label={inPeriod("Points earned from scans", period.key)}
              value={formatPoints(cards.rewards.pointsIssued)}
              hint={formatRupees(cards.rewards.pointsIssuedRupees)}
            />
            <StatCard
              label={inPeriod("Manual changes", period.key)}
              value={formatCount(cards.rewards.manualChanges.count)}
              hint={`+${formatPoints(cards.rewards.manualChanges.pointsAdded)} / −${formatPoints(cards.rewards.manualChanges.pointsTaken)}`}
            />
          </StatSection>
          <LiabilitySection cards={cards.rewards.pointsLiability} />
        </>
      ) : null}

      {cards.products ? (
        <div className="flex flex-col gap-4">
          <StatSection title="Products">
            <StatCard label="Active" value={formatCount(cards.products.active)} hint="now" />
            <StatCard
              label="Switched off"
              value={formatCount(cards.products.inactive)}
              hint="now"
            />
          </StatSection>
          <TopProductsList items={cards.products.topByScans} />
        </div>
      ) : null}

      {cards.qr ? <QrSection cards={cards.qr} period={period.key} /> : null}

      {cards.tasks ? (
        <div className="flex flex-col gap-4">
          <TasksSection title="Tasks (all)" cards={cards.tasks} period={period.key} />
          <StatSection title="Tasks you gave" description="Still open now.">
            <StatCard label="Open" value={formatCount(cards.tasks.givenByMe.open)} />
            <StatCard
              label="Overdue"
              value={formatCount(cards.tasks.givenByMe.overdue)}
              attention={cards.tasks.givenByMe.overdue > 0}
            />
          </StatSection>
        </div>
      ) : null}

      {cards.requests ? <RequestsSection cards={cards.requests} period={period.key} /> : null}
    </div>
  );
}

/** Zonal Head: their zone. */
export function ZonalHeadDashboardView({
  data,
  rankAsmsBy,
  onRankChange,
}: { data: ZonalHeadDashboard } & RankProps) {
  const { cards, period } = data;

  // The page guard usually catches this first; the server's reply is the final word.
  if (!data.zoneId) return <NoZoneMessage />;

  return (
    <div className="flex flex-col gap-8">
      <ZonePayoutsSection cards={cards.payouts} />
      <PartnersSection cards={cards.partners} period={period.key} dormantDays={data.dormantDays} />
      <ScansSection cards={cards.scans} period={period.key} />
      <AsmPerformanceTable rows={cards.asmPerformance} />
      <LeaderboardsSection
        boards={cards.leaderboards}
        rankAsmsBy={rankAsmsBy}
        onRankChange={onRankChange}
      />
      <RequestsSection cards={cards.requests} period={period.key} />
      <TasksSection title="Tasks in your zone" cards={cards.tasks.zone} period={period.key} />
      <TasksSection title="Your own tasks" cards={cards.tasks.mine} period={period.key} />
    </div>
  );
}
