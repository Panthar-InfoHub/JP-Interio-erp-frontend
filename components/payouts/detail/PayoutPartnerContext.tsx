import Link from "next/link";

import { DetailList, DetailRow } from "@/components/common/DetailList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format/date";
import { formatCount, formatPoints } from "@/lib/format/number";
import { payoutStatus } from "@/lib/labels/payout";
import type { StaffPayoutDetail } from "@/types/payout";

/**
 * Facts about the partner to help decide (DEC-156): the wallet now, scans in the last
 * 30 days, when KYC was approved and their last 5 other payouts.
 */
export function PayoutPartnerContext({ payout }: { payout: StaffPayoutDetail }) {
  const { wallet, walletNote, recentScans, recentPayouts, verifiedAt } = payout.partnerContext;

  return (
    <section
      className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
      aria-label="About the partner"
    >
      <h2 className="mb-4 text-base">About the partner</h2>
      <DetailList>
        {wallet ? (
          <>
            <DetailRow label="Points available">
              <span className="inline-flex flex-wrap items-center gap-1.5">
                {formatPoints(wallet.available)}
                {wallet.frozen ? <StatusBadge tone="warning">Frozen</StatusBadge> : null}
              </span>
            </DetailRow>
            <DetailRow label="Points held">{formatPoints(wallet.held)}</DetailRow>
            <DetailRow label="Lifetime earned">{formatPoints(wallet.lifetimeEarned)}</DetailRow>
            <DetailRow label="Lifetime cashed out">
              {formatPoints(wallet.lifetimeRedeemed)}
            </DetailRow>
          </>
        ) : (
          <DetailRow label="Wallet">{walletNote ?? "No wallet yet"}</DetailRow>
        )}
        <DetailRow label={`Scans, last ${recentScans.days} days`}>
          {formatCount(recentScans.scans)} scans · {formatPoints(recentScans.points)}
        </DetailRow>
        <DetailRow label="KYC approved">{verifiedAt ? formatDate(verifiedAt) : null}</DetailRow>
      </DetailList>

      <h3 className="mt-6 mb-3 border-t pt-4 text-sm font-semibold">Other payouts</h3>
      {recentPayouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">This is the partner&apos;s first payout.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {recentPayouts.map((other) => {
            const status = payoutStatus(other.status);
            return (
              <li key={other.id}>
                <Link
                  href={`/payouts/${other.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md py-2 text-sm hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="font-semibold text-primary">{other.payoutNo}</span>
                  <span className="text-muted-foreground">{formatDate(other.createdAt)}</span>
                  <span className="ml-auto inline-flex items-center gap-2">
                    {formatPoints(other.points)}
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
