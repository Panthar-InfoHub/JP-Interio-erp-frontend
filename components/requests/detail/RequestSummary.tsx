"use client";

import Link from "next/link";

import { RequestStageBadge } from "@/components/requests/RequestStageBadge";
import { useCan } from "@/hooks/auth/usePermission";
import type { RequestDetail } from "@/lib/api/requests.api";
import { formatDateTime } from "@/lib/format/date";
import { formatRupees } from "@/lib/format/number";
import { formatPhone } from "@/lib/format/phone";
import { HANDLER_ROLE_LABELS, REQUEST_KIND_LABELS } from "@/lib/labels/request";

function NameLink({ href, children }: { href: string | null; children: string }) {
  return href ? (
    <Link href={href} className="font-semibold text-primary hover:underline">
      {children}
    </Link>
  ) : (
    <span className="font-semibold">{children}</span>
  );
}

/**
 * The request's head (DEC-282): number, stage, kind, made on; the partner and the handler
 * (links only when allowed: Partner 360 with `partners.view`, staff details with
 * `users.view`); the agreed price; zone and ASM when it was made.
 */
export function RequestSummary({ request }: { request: RequestDetail }) {
  const can = useCan();
  const refundDue = request.status === "cancelled" && request.payment !== null;

  return (
    <section
      aria-label="Request"
      className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl">{request.requestNo}</h1>
            <RequestStageBadge status={request.status} refundDue={refundDue} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {REQUEST_KIND_LABELS[request.category]} · made {formatDateTime(request.createdAt)}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-xs text-muted-foreground">Agreed price</p>
          <p className="text-2xl font-semibold">
            {request.agreedAmount
              ? formatRupees(request.agreedAmount)
              : request.category === "sample"
                ? "Free sample"
                : "Not agreed yet"}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Partner</dt>
          <dd className="wrap-break-word">
            <NameLink href={can("partners.view") ? `/partners/${request.partner.id}` : null}>
              {request.partner.name ?? "Unnamed partner"}
            </NameLink>
            {request.partner.businessName ? (
              <span className="block text-muted-foreground">{request.partner.businessName}</span>
            ) : null}
            <span className="block text-muted-foreground">
              {formatPhone(request.partner.phone)}
            </span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Handled by</dt>
          <dd className="wrap-break-word">
            <NameLink href={can("users.view") ? `/staff/${request.handler.id}` : null}>
              {request.handler.name ?? "Unnamed"}
            </NameLink>
            <span className="block text-muted-foreground">
              {HANDLER_ROLE_LABELS[request.handler.role]} · {formatPhone(request.handler.phone)}
            </span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">When it was made</dt>
          <dd className="wrap-break-word">
            {request.zoneAtRequest?.name ?? "No zone"}
            <span className="block text-muted-foreground">
              ASM {request.owningAsmAtRequest?.name ?? "—"}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
