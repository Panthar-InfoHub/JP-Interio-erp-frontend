"use client";

import { ArrowLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { PayoutActionBar } from "@/components/payouts/actions/PayoutActionBar";
import { PayoutAccountSection } from "@/components/payouts/detail/PayoutAccountSection";
import { PayoutPartnerContext } from "@/components/payouts/detail/PayoutPartnerContext";
import { PayoutSteps } from "@/components/payouts/detail/PayoutSteps";
import { PayoutSummary } from "@/components/payouts/detail/PayoutSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/auth/usePermission";
import { usePayout } from "@/hooks/payouts/usePayouts";
import { isApiError } from "@/lib/api/errors";

function BackLink() {
  return (
    <Link
      href="/payouts"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Payouts
    </Link>
  );
}

/**
 * One payout (DEC-156): the head, where to pay, the steps so far, and facts about the
 * partner. The step buttons sit in a bar at the bottom (F5 T2, DEC-254).
 */
export function PayoutDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const can = useCan();
  const payout = usePayout(id);

  if (payout.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the payout">
          <Skeleton className="h-36 rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (payout.isError) {
    // No such payout, or outside my scope: the server answers 404 (R2).
    const notFound = isApiError(payout.error) && payout.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Payout not found" />
          ) : (
            <ErrorState error={payout.error} onRetry={() => void payout.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = payout.data;
  const stillOpen = data.status === "requested" || data.status === "approved";
  const frozen = data.partnerContext.wallet?.frozen === true;

  return (
    <>
      <BackLink />
      <PayoutSummary
        payout={data}
        partnerHref={
          can("partners.view")
            ? `/partners/${data.partner.id}`
            : can("ledger.view")
              ? `/ledger/partner/${data.partner.id}`
              : null
        }
      />

      {frozen && (stillOpen || data.status === "paid") ? (
        // DEC-149: with a frozen wallet nothing can move; the payout waits.
        <p className="mb-6 flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <strong>The partner&apos;s wallet is frozen</strong> (account suspended or not
            verified).{" "}
            {stillOpen
              ? "This payout waits: it can't be approved, declined or paid until the partner is let back in."
              : "It can't be marked failed until the partner is let back in. Correcting the paid details still works."}
          </span>
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <PayoutAccountSection payout={data} />
          <PayoutSteps payout={data} />
        </div>
        <PayoutPartnerContext payout={data} />
      </div>

      <PayoutActionBar payout={data} />
    </>
  );
}
