import { DetailList, DetailRow } from "@/components/common/DetailList";
import { MaskedValue } from "@/components/common/MaskedValue";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { partnerTypeLabel } from "@/lib/labels/partner";
import type { Partner360 } from "@/types/partner";

/** Sign-up steps (backend onboarding.service.ts `NextStep`). */
const STEP_LABELS: Record<string, string> = {
  basic_info: "Basic details",
  firm_details: "Firm details",
  payout_account: "Bank / UPI account",
  kyc_documents: "KYC documents",
  submit: "Review and submit",
  done: "Submitted",
};

function stepLabel(step: string): string {
  return STEP_LABELS[step] ?? step.replaceAll("_", " ");
}

/** Contact, address, firm details and how the partner signed up. */
export function PartnerDetailsTab({ partner }: { partner: Partner360 }) {
  const info = partner.basicInfo;
  const firm = partner.firmDetails;

  return (
    <div className="flex flex-col gap-8">
      {partner.kycState === "not_submitted" ? (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          Sign-up not finished. Next step: <strong>{stepLabel(partner.nextStep)}</strong>.
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-base">Contact and address</h2>
        {info ? (
          <DetailList>
            <DetailRow label="Name">{info.name}</DetailRow>
            <DetailRow label="Mobile">{formatPhone(info.phone)}</DetailRow>
            <DetailRow label="Email">{info.email}</DetailRow>
            <DetailRow label="Partner type">{partnerTypeLabel(info.partnerType)}</DetailRow>
            <DetailRow label="Business name">{info.businessName}</DetailRow>
            <DetailRow label="Address">{info.address}</DetailRow>
            <DetailRow label="City / State">
              {[info.city, info.state].filter(Boolean).join(", ") || null}
            </DetailRow>
            <DetailRow label="Pincode">{info.pincode}</DetailRow>
            <DetailRow label="Zone">
              {info.zone ? `${info.zone.name} (${info.zone.code})` : null}
            </DetailRow>
          </DetailList>
        ) : (
          <p className="text-sm text-muted-foreground">Basic details not filled in yet.</p>
        )}
      </section>

      {firm ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base">Firm details</h2>
          <DetailList>
            <DetailRow label="Firm name">{firm.firmName}</DetailRow>
            <DetailRow label="GST number">
              <MaskedValue value={firm.gstNumber} label="GST number" />
            </DetailRow>
            <DetailRow label="Owner's date of birth">
              {firm.ownerDob ? formatDate(`${firm.ownerDob}T00:00:00+05:30`) : null}
            </DetailRow>
            <DetailRow label="Anniversary">
              {firm.ownerAnniversaryDate
                ? formatDate(`${firm.ownerAnniversaryDate}T00:00:00+05:30`)
                : null}
            </DetailRow>
            <DetailRow label="Spouse's name">{firm.ownerSpouseName}</DetailRow>
          </DetailList>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-base">Sign-up</h2>
        <DetailList>
          <DetailRow label="Signed up by">
            {partner.startedBy
              ? `${partner.startedBy.name ?? "—"} (${partner.startedBy.role ?? "staff"}, ${formatPhone(partner.startedBy.phone)})`
              : "The partner, from the partner app"}
          </DetailRow>
          <DetailRow label="Started">{formatDateTime(partner.joinedAt)}</DetailRow>
          <DetailRow label="Submitted for KYC">
            {partner.submittedAt ? formatDateTime(partner.submittedAt) : null}
          </DetailRow>
          <DetailRow label="Last KYC review">
            {partner.reviewedAt ? formatDateTime(partner.reviewedAt) : null}
          </DetailRow>
          {partner.rejectionReason ? (
            <DetailRow label="Rejection reason">{partner.rejectionReason}</DetailRow>
          ) : null}
        </DetailList>
      </section>
    </div>
  );
}
