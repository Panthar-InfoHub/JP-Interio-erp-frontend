import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { ACCOUNT_STATUS, KYC_STATE, partnerTypeLabel } from "@/lib/labels/partner";
import type { NumberHolder } from "@/types/partner";

const STEP_LABELS: Record<string, string> = {
  basic_info: "Basic details",
  firm_details: "Firm details",
  payout_account: "Bank / UPI account",
  kyc_documents: "KYC documents",
  submitted: "Submitted",
};

/** One partner holding the looked-up number. */
export function HolderCard({
  holder,
  onRemove,
}: {
  holder: NumberHolder;
  /** Shown only for an unfinished draft (`canRemoveDraft`). */
  onRemove: (holder: NumberHolder) => void;
}) {
  const kyc = KYC_STATE[holder.kycState] ?? { label: holder.kycState, tone: "neutral" as const };
  const account = ACCOUNT_STATUS[holder.accountStatus];
  const draft = holder.kycState === "not_submitted";

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold wrap-break-word">{holder.name ?? "Name not given yet"}</p>
          <p className="text-sm text-muted-foreground">
            {formatPhone(holder.phone)}
            {holder.businessName ? ` · ${holder.businessName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge tone={kyc.tone}>{kyc.label}</StatusBadge>
          <StatusBadge tone={account.tone}>{account.label}</StatusBadge>
          {holder.numberStatus === "in_use" ? (
            <StatusBadge tone="info">Number in use</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Old copy, still blocks</StatusBadge>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Type · Zone:</dt>
          <dd>
            {partnerTypeLabel(holder.partnerType)} · {holder.zone?.name ?? "—"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Signed up by:</dt>
          <dd>
            {holder.startedBy
              ? `${holder.startedBy.name ?? "—"} (${holder.startedBy.role ?? "staff"})`
              : "The partner (self sign-up)"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Started:</dt>
          <dd>{formatDateTime(holder.startedAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">{draft ? "Stopped at:" : "Submitted:"}</dt>
          <dd>
            {draft
              ? (STEP_LABELS[holder.onboardingStep] ?? holder.onboardingStep)
              : formatDateTime(holder.submittedAt)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/partners/${holder.partnerId}`} />}
        >
          <ExternalLink data-icon="inline-start" />
          Open partner
        </Button>
        {holder.canRemoveDraft ? (
          <Button variant="destructive" size="sm" onClick={() => onRemove(holder)}>
            <Trash2 data-icon="inline-start" />
            Remove this draft
          </Button>
        ) : (
          <p className="self-center text-xs text-muted-foreground">
            Only unfinished sign-ups can be removed.
          </p>
        )}
      </div>
    </li>
  );
}
