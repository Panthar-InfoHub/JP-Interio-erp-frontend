"use client";

import Link from "next/link";

import { useCan } from "@/hooks/auth/usePermission";
import type { RequestListRow } from "@/lib/api/requests.api";
import { formatPhone } from "@/lib/format/phone";

/**
 * The request's partner: name, business, phone (DEC-281). The name opens Partner 360 only
 * for someone with `partners.view` (Admin, Zonal Head); the Requests Sub-Admin sees plain
 * text. The link doesn't open the row.
 */
export function RequestPartnerCell({ partner }: { partner: RequestListRow["partner"] }) {
  const can = useCan();
  const name = partner.name ?? "Unnamed partner";

  return (
    <div className="min-w-0">
      {can("partners.view") ? (
        <Link
          href={`/partners/${partner.id}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="block truncate font-medium text-primary underline-offset-4 hover:underline"
        >
          {name}
        </Link>
      ) : (
        <p className="truncate font-medium">{name}</p>
      )}
      {partner.businessName ? (
        <p className="truncate text-xs text-muted-foreground">{partner.businessName}</p>
      ) : null}
      <p className="truncate text-xs text-muted-foreground">{formatPhone(partner.phone)}</p>
    </div>
  );
}
