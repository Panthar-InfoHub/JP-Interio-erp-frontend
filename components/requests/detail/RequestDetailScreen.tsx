"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { RequestDeliveryCard } from "@/components/requests/detail/RequestDeliveryCard";
import { RequestItemsCard } from "@/components/requests/detail/RequestItemsCard";
import { RequestMoneyCard } from "@/components/requests/detail/RequestMoneyCard";
import { RequestSummary } from "@/components/requests/detail/RequestSummary";
import { RequestTimeline } from "@/components/requests/detail/RequestTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequest } from "@/hooks/requests/useRequests";
import { isApiError } from "@/lib/api/errors";
import { safeFrom } from "@/lib/navigation/returnTo";

/** Back to the page that opened it (`?from=`, DEC-283), else to the Requests list. */
function BackLink() {
  const from = safeFrom(useSearchParams().get("from"));
  return (
    <Link
      href={from ?? "/requests"}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {from ? "Back" : "Requests"}
    </Link>
  );
}

/**
 * One shipment / sample request, read only (`requests.view`, DEC-164, DEC-282): the head,
 * items, delivery, payment and refund, and the full timeline. Out of scope → "not found".
 */
export function RequestDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const request = useRequest(id);

  if (request.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the request">
          <Skeleton className="h-44 rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (request.isError) {
    // No such request, or outside my scope: the server answers 404 (R2).
    const notFound = isApiError(request.error) && request.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Request not found" />
          ) : (
            <ErrorState error={request.error} onRetry={() => void request.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = request.data;

  return (
    <>
      <BackLink />
      <RequestSummary request={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <RequestItemsCard items={data.items} />
          <RequestDeliveryCard request={data} />
          {data.payment ? (
            <RequestMoneyCard title="Payment" money={data.payment} amount={data.agreedAmount} />
          ) : null}
          {data.refund ? (
            <RequestMoneyCard title="Refund" money={data.refund} amount={data.agreedAmount} />
          ) : null}
        </div>
        <RequestTimeline timeline={data.timeline} />
      </div>
    </>
  );
}
