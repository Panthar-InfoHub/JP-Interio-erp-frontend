import { StatusBadge } from "@/components/common/StatusBadge";
import { PartnerActionsMenu } from "@/components/partners/actions/PartnerActionsMenu";
import { formatPhone } from "@/lib/format/phone";
import { ACCOUNT_STATUS, KYC_STATE, partnerTypeLabel } from "@/lib/labels/partner";
import type { Partner360 } from "@/types/partner";

/**
 * Name, badges and who looks after the partner. `showActions` adds the Actions menu
 * (Partner 360); the KYC review page leaves it out.
 */
export function PartnerHeader({
  partner,
  showActions = true,
}: {
  partner: Partner360;
  showActions?: boolean;
}) {
  const info = partner.basicInfo;
  const kyc = KYC_STATE[partner.kycState];
  const account = ACCOUNT_STATUS[partner.accountStatus];
  const name = info?.name ?? "Name not given yet";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl wrap-break-word">{name}</h1>
          {info?.businessName ? (
            <p className="text-sm text-muted-foreground">{info.businessName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={kyc.tone}>{kyc.label}</StatusBadge>
          <StatusBadge tone={account.tone}>{account.label}</StatusBadge>
          {showActions ? <PartnerActionsMenu partner={partner} /> : null}
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Mobile</dt>
          <dd>{formatPhone(info?.phone)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Type · Zone</dt>
          <dd>
            {partnerTypeLabel(info?.partnerType)} · {info?.zone?.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">ASM</dt>
          <dd>{partner.asm?.name ?? "Not assigned yet"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Sales Executive</dt>
          <dd>{partner.salesExecutive?.name ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
