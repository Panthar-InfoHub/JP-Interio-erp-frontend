"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { TicketHandlingCard } from "@/components/tickets/detail/TicketHandlingCard";
import { TicketPartnerCard } from "@/components/tickets/detail/TicketPartnerCard";
import { TicketProblemCard } from "@/components/tickets/detail/TicketProblemCard";
import { TicketSummary } from "@/components/tickets/detail/TicketSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useTicket } from "@/hooks/tickets/useTickets";
import { isApiError } from "@/lib/api/errors";
import { safeFrom } from "@/lib/navigation/returnTo";

/** Back to the page that opened it (`?from=`, DEC-283), else to the ticket queue. */
function BackLink() {
  const from = safeFrom(useSearchParams().get("from"));
  return (
    <Link
      href={from ?? "/tickets"}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {from ? "Back" : "Support tickets"}
    </Link>
  );
}

/**
 * One support ticket (Admin only, DEC-296): head with the moves, the problem with photos,
 * the partner, and how it was handled. Unknown → "not found".
 */
export function TicketDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const ticket = useTicket(id);

  if (ticket.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the ticket">
          <Skeleton className="h-28 rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (ticket.isError) {
    // A bad id is a 400 from the server; treat it like an unknown ticket.
    const notFound =
      isApiError(ticket.error) && (ticket.error.status === 404 || ticket.error.status === 400);
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Ticket not found" />
          ) : (
            <ErrorState error={ticket.error} onRetry={() => void ticket.refetch()} />
          )}
        </div>
      </>
    );
  }

  const data = ticket.data;

  return (
    <>
      <BackLink />
      <TicketSummary ticket={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TicketProblemCard ticket={data} />
        <div className="flex flex-col gap-4">
          <TicketPartnerCard partner={data.partner} />
          <TicketHandlingCard ticket={data} />
        </div>
      </div>
    </>
  );
}
