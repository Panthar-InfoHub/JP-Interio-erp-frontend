"use client";

import { ArrowLeft, ExternalLink, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { AdjustPointsDialog } from "@/components/ledger/AdjustPointsDialog";
import { PartnerScansTab } from "@/components/ledger/partner/PartnerScansTab";
import { PartnerStatementTab } from "@/components/ledger/partner/PartnerStatementTab";
import { WalletCards } from "@/components/ledger/partner/WalletCards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/auth/usePermission";
import { usePartnerWallet } from "@/hooks/ledger/useLedger";
import { isApiError } from "@/lib/api/errors";
import { formatPhone } from "@/lib/format/phone";
import { cn } from "@/lib/utils";

type Tab = "statement" | "scans";

function BackLink() {
  return (
    <Link
      href="/ledger"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Points ledger
    </Link>
  );
}

/**
 * One partner's points (DEC-250, DEC-256), for every role with `ledger.view`, including
 * the Rewards Sub-Admin who has no Partner 360: wallet cards, then Statement and Scans
 * (`scans.view`) tabs. "Adjust points" with `ledger.adjust`; "Open Partner 360" with
 * `partners.view`. The tab is kept in the address (`?tab=scans`); switching it starts
 * that tab's filters fresh.
 */
export function PartnerPointsScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const can = useCan();
  const wallet = usePartnerWallet(id);
  const [adjusting, setAdjusting] = useState(false);

  const canScans = can("scans.view");
  const tab: Tab = canScans && searchParams.get("tab") === "scans" ? "scans" : "statement";
  const openTab = (next: Tab) =>
    router.replace(next === "scans" ? `${pathname}?tab=scans` : pathname, { scroll: false });

  if (wallet.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the points">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </>
    );
  }

  if (wallet.isError) {
    // No such partner, or outside my scope: the server answers 404 (R2).
    const notFound = isApiError(wallet.error) && wallet.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Partner not found" />
          ) : (
            <ErrorState error={wallet.error} onRetry={() => void wallet.refetch()} />
          )}
        </div>
      </>
    );
  }

  const { partner, wallet: partnerWallet, note } = wallet.data;
  const name = partner.name ?? "Unnamed partner";
  const canAdjust = can("ledger.adjust");
  const adjustBlocked = !partnerWallet
    ? "No wallet yet: the partner isn't verified."
    : partnerWallet.frozen
      ? "The wallet is frozen: no points can move."
      : undefined;

  return (
    <>
      <BackLink />

      <section className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="text-xl">{name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[partner.businessName, formatPhone(partner.phone), partner.zone?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can("partners.view") ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/partners/${partner.id}`} />}
            >
              <ExternalLink data-icon="inline-start" />
              Open Partner 360
            </Button>
          ) : null}
          {canAdjust ? (
            <Button
              disabled={Boolean(adjustBlocked)}
              title={adjustBlocked}
              onClick={() => setAdjusting(true)}
            >
              <SlidersHorizontal data-icon="inline-start" />
              Adjust points
            </Button>
          ) : null}
        </div>
      </section>

      <WalletCards wallet={partnerWallet} note={note} />

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        {canScans ? (
          <div
            role="tablist"
            aria-label="Points views"
            className="mb-4 inline-flex rounded-lg border p-0.5"
          >
            {(
              [
                { value: "statement", label: "Statement" },
                { value: "scans", label: "Scans" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                onClick={() => openTab(item.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  tab === item.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="mb-4 text-base">Statement</h2>
        )}

        {tab === "scans" ? (
          <PartnerScansTab partnerId={partner.id} />
        ) : (
          <PartnerStatementTab partnerId={partner.id} />
        )}
      </div>

      {adjusting && partnerWallet ? (
        <AdjustPointsDialog
          partnerId={partner.id}
          partnerName={name}
          available={partnerWallet.available}
          open
          onOpenChange={(next) => !next && setAdjusting(false)}
        />
      ) : null}
    </>
  );
}
