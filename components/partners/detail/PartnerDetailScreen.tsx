"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { PartnerScansTab } from "@/components/ledger/partner/PartnerScansTab";
import { PartnerAccountsTab } from "@/components/partners/detail/PartnerAccountsTab";
import { PartnerDetailsTab } from "@/components/partners/detail/PartnerDetailsTab";
import { PartnerHeader } from "@/components/partners/detail/PartnerHeader";
import { PartnerHistoryTab } from "@/components/partners/detail/PartnerHistoryTab";
import { PartnerKycTab } from "@/components/partners/detail/PartnerKycTab";
import { PartnerPayoutsTab } from "@/components/partners/detail/PartnerPayoutsTab";
import { PartnerPointsTab } from "@/components/partners/detail/PartnerPointsTab";
import { PartnerSummary } from "@/components/partners/detail/PartnerSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/hooks/auth/usePermission";
import { usePartner } from "@/hooks/partners/usePartners";
import { isApiError } from "@/lib/api/errors";

function BackLink() {
  return (
    <Link
      href="/partners"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Partners
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the partner">
      <Skeleton className="h-36 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

type Tab = "details" | "kyc" | "accounts" | "points" | "scans" | "payouts" | "history";

/**
 * Partner 360 (any state). Header + summary boxes, then tabs (DEC-240, DEC-258):
 * Details · KYC documents · Payout accounts · Points · Scans · Payouts · History, each
 * shown only to roles allowed to see it. The open tab is kept as `?tab=`.
 */
export function PartnerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const can = useCan();
  const partner = usePartner(id);

  if (partner.isPending) {
    return (
      <>
        <BackLink />
        <DetailSkeleton />
      </>
    );
  }

  if (partner.isError) {
    // No such partner, or outside my scope: the server answers 404 (R2).
    const notFound = isApiError(partner.error) && partner.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Partner not found" />
          ) : (
            <ErrorState error={partner.error} onRetry={() => void partner.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = partner.data;
  // Points / Payouts appear only when the server sends their box (ledger.view /
  // payouts.view, in scope); Scans with scans.view (DEC-258).
  const tabs: { value: Tab; label: string }[] = [
    { value: "details", label: "Details" },
    { value: "kyc", label: "KYC documents" },
    {
      value: "accounts",
      label: `Payout accounts${data.payoutAccounts.length > 0 ? ` (${data.payoutAccounts.length})` : ""}`,
    },
    ...(data.points ? [{ value: "points" as const, label: "Points" }] : []),
    ...(can("scans.view") ? [{ value: "scans" as const, label: "Scans" }] : []),
    ...(data.payouts ? [{ value: "payouts" as const, label: "Payouts" }] : []),
    { value: "history", label: "History" },
  ];
  const requested = searchParams.get("tab");
  const tab = tabs.find((item) => item.value === requested)?.value ?? "details";

  // The tab lives in the address; switching drops the old tab's filters and paging.
  const openTab = (next: Tab) =>
    router.replace(next === "details" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  return (
    <>
      <BackLink />
      <PartnerHeader partner={data} />
      <PartnerSummary partner={data} />

      <Tabs value={tab} onValueChange={(next) => openTab(next as Tab)} className="gap-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            {tabs.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {/* Only the open tab is drawn, so each list loads only when its tab is opened. */}
        <TabsContent value={tab} className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          {tab === "details" ? <PartnerDetailsTab partner={data} /> : null}
          {tab === "kyc" ? <PartnerKycTab partner={data} /> : null}
          {tab === "accounts" ? <PartnerAccountsTab partner={data} /> : null}
          {tab === "points" ? <PartnerPointsTab partner={data} /> : null}
          {tab === "scans" ? <PartnerScansTab partnerId={data.partnerId} /> : null}
          {tab === "payouts" ? <PartnerPayoutsTab partnerId={data.partnerId} /> : null}
          {tab === "history" ? <PartnerHistoryTab partner={data} /> : null}
        </TabsContent>
      </Tabs>
    </>
  );
}
