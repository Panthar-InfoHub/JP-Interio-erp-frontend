import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";
import type { Partner360 } from "@/types/partner";

/**
 * Summary boxes from Partner 360. The server includes each box only for roles allowed to
 * see it (points: ledger.view, payouts: payouts.view, requests: requests.view,
 * tickets: Admin), so a missing box is simply not shown. Full lists come in F5 (DEC-239).
 */
export function PartnerSummary({ partner }: { partner: Partner360 }) {
  const { points, payouts, requests, tickets } = partner;
  if (!points && !payouts && !requests && !tickets) return null;

  return (
    <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {points ? (
        points.wallet ? (
          <StatCard
            label="Points available"
            value={formatPoints(points.wallet.available)}
            hint={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                {formatPoints(points.wallet.held)} held · {formatCount(points.wallet.scanCount)}{" "}
                scans
                {points.wallet.frozen ? <StatusBadge tone="warning">Frozen</StatusBadge> : null}
              </span>
            }
          />
        ) : (
          <StatCard label="Points" value="—" hint={points.note ?? "No wallet yet"} />
        )
      ) : null}
      {points?.wallet ? (
        <StatCard
          label="Lifetime earned"
          value={formatPoints(points.wallet.lifetimeEarned)}
          hint={`${formatPoints(points.wallet.lifetimeRedeemed)} cashed out`}
        />
      ) : null}
      {payouts ? (
        <StatCard
          label="Payouts open"
          value={formatCount(payouts.open.count)}
          hint={`${formatRupees(payouts.open.rupees)} · paid out ${formatRupees(payouts.paidOut.rupees)}`}
        />
      ) : null}
      {requests ? (
        <StatCard
          label="Requests open"
          value={formatCount(requests.open)}
          hint={`${formatCount(requests.total)} in total`}
        />
      ) : null}
      {tickets ? (
        <StatCard
          label="Support tickets open"
          value={formatCount(tickets.open + tickets.in_progress)}
          hint={`${formatCount(tickets.total)} in total`}
        />
      ) : null}
    </section>
  );
}
