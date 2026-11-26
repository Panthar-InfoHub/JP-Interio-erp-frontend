"use client";

import Link from "next/link";

import { DetailList, DetailRow } from "@/components/common/DetailList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useCan } from "@/hooks/auth/usePermission";
import type { TicketPartner } from "@/lib/api/tickets.api";
import { formatPhone } from "@/lib/format/phone";
import { ACCOUNT_STATUS, KYC_STATE, partnerTypeLabel } from "@/lib/labels/partner";
import type { AccountStatus, KycState } from "@/types/partner";

/** Who raised it (DEC-296): the name opens Partner 360 for staff who may see partners. */
export function TicketPartnerCard({ partner }: { partner: TicketPartner }) {
  const can = useCan();
  const name = partner.name ?? "Sign-up not finished";
  const kyc = partner.kycState ? KYC_STATE[partner.kycState as KycState] : null;
  const account = ACCOUNT_STATUS[partner.status as AccountStatus];

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Partner">
      <h2 className="mb-4 text-base">Partner</h2>
      <DetailList>
        <DetailRow label="Name">
          {can("partners.view") ? (
            <Link
              href={`/partners/${partner.id}`}
              className="font-semibold text-primary hover:underline"
            >
              {name}
            </Link>
          ) : (
            <span className="font-semibold">{name}</span>
          )}
        </DetailRow>
        <DetailRow label="Mobile">{formatPhone(partner.phone)}</DetailRow>
        <DetailRow label="Business">{partner.businessName ?? "—"}</DetailRow>
        <DetailRow label="Type">{partnerTypeLabel(partner.partnerType)}</DetailRow>
        <DetailRow label="Zone">{partner.zone?.name ?? "No zone"}</DetailRow>
        <DetailRow label="KYC">
          {kyc ? <StatusBadge tone={kyc.tone}>{kyc.label}</StatusBadge> : "—"}
        </DetailRow>
        <DetailRow label="Account">
          {account ? (
            <StatusBadge tone={account.tone}>{account.label}</StatusBadge>
          ) : (
            partner.status
          )}
        </DetailRow>
      </DetailList>
    </section>
  );
}
