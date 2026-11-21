import { DocumentPreview } from "@/components/common/DocumentPreview";
import { MaskedValue } from "@/components/common/MaskedValue";
import type { KycDocument, Partner360 } from "@/types/partner";

function DocumentCard({
  title,
  label,
  document,
  number,
  fileUrl,
}: {
  title: string;
  label: string;
  document?: KycDocument | null;
  number?: string | null;
  fileUrl?: string | null;
}) {
  const value = number ?? document?.number ?? null;
  const url = fileUrl ?? document?.fileUrl ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm">
          {value ? (
            <MaskedValue value={value} label={label} />
          ) : (
            <span className="text-muted-foreground">Not given</span>
          )}
        </p>
      </div>
      {value || url ? <DocumentPreview url={url} title={title} /> : null}
    </div>
  );
}

/** PAN, Aadhaar and (dealer / OEM) GST: numbers masked until "Show", photos as previews. */
export function PartnerKycTab({ partner }: { partner: Partner360 }) {
  const { pan, aadhaar } = partner.kycDocuments;
  const firm = partner.firmDetails;
  const nothing = !pan && !aadhaar && !firm;

  if (nothing) {
    return (
      <p className="text-sm text-muted-foreground">
        No KYC documents yet. They are added during sign-up.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DocumentCard title="PAN card" label="PAN" document={pan} />
      <DocumentCard title="Aadhaar card" label="Aadhaar" document={aadhaar} />
      {firm ? (
        <DocumentCard
          title="GST certificate"
          label="GST number"
          number={firm.gstNumber}
          fileUrl={firm.gstCertificateUrl}
        />
      ) : null}
    </div>
  );
}
