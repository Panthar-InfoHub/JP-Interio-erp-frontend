import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";
import type { Wallet } from "@/types/ledger";

/**
 * A partner's wallet now (DEC-129): available (₹), held in cash-out requests, lifetime
 * earned from scans, cashed out, net hand adjustments and scans. A partner who isn't
 * verified has no wallet: the server's note is shown instead.
 */
export function WalletCards({ wallet, note }: { wallet: Wallet | null; note: string | null }) {
  if (!wallet) {
    return (
      <p className="mb-6 rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">
        {note ?? "No wallet yet."}
      </p>
    );
  }

  return (
    <section aria-label="Wallet" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatCard
        label="Available"
        value={formatPoints(wallet.available)}
        hint={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {formatRupees(wallet.availableRupees)}
            {wallet.frozen ? <StatusBadge tone="warning">Frozen</StatusBadge> : null}
          </span>
        }
      />
      <StatCard
        label="Held in cash-outs"
        value={formatPoints(wallet.held)}
        hint={formatRupees(wallet.heldRupees)}
      />
      <StatCard
        label="Lifetime earned"
        value={formatPoints(wallet.lifetimeEarned)}
        hint={`${formatCount(wallet.scanCount)} scans`}
      />
      <StatCard
        label="Cashed out"
        value={formatPoints(wallet.lifetimeRedeemed)}
        hint={formatRupees(wallet.lifetimeRedeemedRupees)}
      />
      <StatCard
        label="Hand adjustments"
        value={`${wallet.netAdjusted > 0 ? "+" : ""}${formatCount(wallet.netAdjusted)} pts`}
        hint="Added − taken away"
      />
    </section>
  );
}
