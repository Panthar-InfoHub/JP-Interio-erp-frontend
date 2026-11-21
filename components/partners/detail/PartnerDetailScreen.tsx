"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { PartnerAccountsTab } from "@/components/partners/detail/PartnerAccountsTab";
import { PartnerDetailsTab } from "@/components/partners/detail/PartnerDetailsTab";
import { PartnerHeader } from "@/components/partners/detail/PartnerHeader";
import { PartnerHistoryTab } from "@/components/partners/detail/PartnerHistoryTab";
import { PartnerKycTab } from "@/components/partners/detail/PartnerKycTab";
import { PartnerSummary } from "@/components/partners/detail/PartnerSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

/**
 * Partner 360 (any state). Header + summary boxes, then tabs (DEC-240):
 * Details · KYC documents · Payout accounts · History.
 */
export function PartnerDetailScreen() {
  const { id } = useParams<{ id: string }>();
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
  return (
    <>
      <BackLink />
      <PartnerHeader partner={data} />
      <PartnerSummary partner={data} />

      <Tabs defaultValue="details" className="gap-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="kyc">KYC documents</TabsTrigger>
            <TabsTrigger value="accounts">
              Payout accounts
              {data.payoutAccounts.length > 0 ? ` (${data.payoutAccounts.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <TabsContent value="details">
            <PartnerDetailsTab partner={data} />
          </TabsContent>
          <TabsContent value="kyc">
            <PartnerKycTab partner={data} />
          </TabsContent>
          <TabsContent value="accounts">
            <PartnerAccountsTab partner={data} />
          </TabsContent>
          <TabsContent value="history">
            <PartnerHistoryTab partner={data} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
