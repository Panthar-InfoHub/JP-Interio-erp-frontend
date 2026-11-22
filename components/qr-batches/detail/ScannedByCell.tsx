"use client";

import Link from "next/link";

import { useCan } from "@/hooks/auth/usePermission";
import type { QrScannedBy } from "@/lib/api/qr.api";
import { formatPhone } from "@/lib/format/phone";
import { PARTNER_TYPE_LABELS } from "@/lib/labels/partner";

/**
 * The partner who scanned a code (DEC-276): name, mobile and type. The name opens
 * Partner 360 only for someone who may see partners (`partners.view`, the Admin);
 * the QR Sub-Admin sees plain text.
 */
export function ScannedByCell({ partner }: { partner: QrScannedBy }) {
  const can = useCan();
  if (!partner) return <span className="text-muted-foreground">—</span>;

  const name = partner.name ?? "Unnamed partner";
  const type = partner.partnerType ? PARTNER_TYPE_LABELS[partner.partnerType] : null;

  return (
    <div className="min-w-0">
      {can("partners.view") ? (
        <Link
          href={`/partners/${partner.id}`}
          onClick={(event) => event.stopPropagation()}
          className="block truncate font-medium text-primary underline-offset-4 hover:underline"
        >
          {name}
        </Link>
      ) : (
        <p className="truncate">{name}</p>
      )}
      <p className="truncate text-xs text-muted-foreground">
        {formatPhone(partner.phone)}
        {type ? ` · ${type}` : ""}
      </p>
    </div>
  );
}
