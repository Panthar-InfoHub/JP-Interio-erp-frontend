import { StatCard } from "@/components/dashboard/StatCard";
import { StatSection } from "@/components/dashboard/StatSection";
import { inPeriod, REQUEST_STAGE_LABELS } from "@/components/dashboard/periodText";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";
import type {
  CountAmount,
  DashboardPeriodKey,
  LiabilityCards,
  PartnerCards,
  PayoutCards,
  QrCards,
  RequestCards,
  ScanCards,
  TaskCards,
} from "@/types/dashboard";

/**
 * The card groups every dashboard shares. Each takes the server's numbers for one area;
 * which groups a person sees is decided by the server's reply (DEC-220).
 * Cards marked "now" show the current state whatever the period.
 */

export function PartnersSection({
  cards,
  period,
  dormantDays,
}: {
  cards: PartnerCards;
  period: DashboardPeriodKey;
  dormantDays: number;
}) {
  return (
    <StatSection
      title="Partners"
      description={`Active = scanned at least once in the last ${dormantDays} days.`}
    >
      <StatCard label="Signed up" value={formatCount(cards.total)} hint="now" />
      <StatCard label={inPeriod("New", period)} value={formatCount(cards.newInPeriod)} />
      <StatCard label="Active" value={formatCount(cards.active)} hint="now" />
      <StatCard label="Dormant" value={formatCount(cards.dormant)} hint="now" />
      <StatCard
        label="KYC waiting"
        value={formatCount(cards.kycPending)}
        hint="now"
        attention={cards.kycPending > 0}
      />
      <StatCard label="Suspended" value={formatCount(cards.suspended)} hint="now" />
    </StatSection>
  );
}

export function ScansSection({ cards, period }: { cards: ScanCards; period: DashboardPeriodKey }) {
  return (
    <StatSection title="Scans">
      <StatCard label={inPeriod("Scans", period)} value={formatCount(cards.scans)} />
      <StatCard
        label={inPeriod("Points earned", period)}
        value={formatPoints(cards.pointsIssued)}
        hint={formatRupees(cards.pointsIssuedRupees)}
      />
    </StatSection>
  );
}

function countAmount(value: CountAmount) {
  return { value: formatCount(value.count), hint: formatRupees(value.amount) };
}

export function PayoutsSection({
  cards,
  period,
}: {
  cards: PayoutCards;
  period: DashboardPeriodKey;
}) {
  return (
    <StatSection title="Payouts">
      <StatCard
        label="Waiting for approval"
        {...countAmount(cards.waitingApproval)}
        attention={cards.waitingApproval.count > 0}
      />
      <StatCard
        label="Approved, not paid yet"
        {...countAmount(cards.approvedNotPaid)}
        attention={cards.approvedNotPaid.count > 0}
      />
      <StatCard label={inPeriod("Paid", period)} {...countAmount(cards.paidInPeriod)} />
      <StatCard label={inPeriod("Failed", period)} {...countAmount(cards.failedInPeriod)} />
    </StatSection>
  );
}

/** Zonal Head: payouts of their zone waiting on them (now). */
export function ZonePayoutsSection({
  cards,
}: {
  cards: { toApprove: CountAmount; toPay: CountAmount };
}) {
  return (
    <StatSection title="Payouts waiting on you">
      <StatCard
        label="To approve"
        {...countAmount(cards.toApprove)}
        attention={cards.toApprove.count > 0}
      />
      <StatCard label="To pay" {...countAmount(cards.toPay)} attention={cards.toPay.count > 0} />
    </StatSection>
  );
}

export function LiabilitySection({ cards }: { cards: LiabilityCards }) {
  return (
    <StatSection
      title="Points owed to partners"
      description="All partners' points not paid out yet (now). 1 point = ₹1."
    >
      <StatCard
        label="Total owed"
        value={formatPoints(cards.owed)}
        hint={formatRupees(cards.owedRupees)}
      />
      <StatCard label="Available to cash out" value={formatPoints(cards.available)} />
      <StatCard label="Held for payouts" value={formatPoints(cards.held)} />
    </StatSection>
  );
}

export function RequestsSection({
  cards,
  period,
}: {
  cards: RequestCards;
  period: DashboardPeriodKey;
}) {
  const stages = Object.entries(cards.openByStage).filter(([, count]) => count > 0);
  return (
    <StatSection title="Shipment & sample requests">
      <StatCard label="Open" value={formatCount(cards.open)} hint="now" />
      <StatCard
        label="Open order value"
        value={formatRupees(cards.pipelineValue)}
        hint="agreed prices of open requests"
      />
      <StatCard
        label={inPeriod("Delivered", period)}
        value={formatCount(cards.deliveredInPeriod)}
      />
      <StatCard
        label="Refunds waiting"
        value={formatCount(cards.refundsWaiting)}
        hint="now"
        attention={cards.refundsWaiting > 0}
      />
      {stages.length > 0 ? (
        <div className="col-span-2 rounded-xl border bg-card p-4 shadow-sm lg:col-span-4">
          <p className="text-sm text-muted-foreground">Open requests by stage (now)</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            {stages.map(([stage, count]) => (
              <li key={stage} className="flex gap-2">
                <span>{REQUEST_STAGE_LABELS[stage] ?? stage}</span>
                <span className="font-semibold tabular-nums">{formatCount(count)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </StatSection>
  );
}

export function TasksSection({
  title = "Tasks",
  cards,
  period,
}: {
  title?: string;
  cards: TaskCards;
  period: DashboardPeriodKey;
}) {
  return (
    <StatSection title={title}>
      <StatCard label="Open" value={formatCount(cards.open)} hint="now" />
      <StatCard
        label="Overdue"
        value={formatCount(cards.overdue)}
        hint="now"
        attention={cards.overdue > 0}
      />
      <StatCard
        label={inPeriod("Completed", period)}
        value={formatCount(cards.completedInPeriod)}
      />
    </StatSection>
  );
}

export function QrSection({ cards, period }: { cards: QrCards; period: DashboardPeriodKey }) {
  return (
    <StatSection title="QR codes" description="Batches made in the period; their codes' state now.">
      <StatCard label={inPeriod("Batches made", period)} value={formatCount(cards.batchesMade)} />
      <StatCard label="Batches voided" value={formatCount(cards.batchesVoided)} />
      <StatCard label="Codes" value={formatCount(cards.codes.total)} />
      <StatCard label="Printed" value={formatCount(cards.codes.printed)} />
      <StatCard label="Scanned" value={formatCount(cards.codes.scanned)} />
      <StatCard label="Not scanned" value={formatCount(cards.codes.notScanned)} />
      <StatCard label="Void" value={formatCount(cards.codes.void)} />
    </StatSection>
  );
}
