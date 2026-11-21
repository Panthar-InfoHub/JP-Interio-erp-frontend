import { Landmark, Smartphone } from "lucide-react";

import { DetailList, DetailRow } from "@/components/common/DetailList";
import { DocumentPreview } from "@/components/common/DocumentPreview";
import { MaskedValue } from "@/components/common/MaskedValue";
import { PAID_METHOD_LABELS } from "@/lib/labels/payout";
import type { StaffPayoutDetail } from "@/types/payout";

/**
 * Where to send the money: the account copied when the partner asked (DEC-151), so
 * later edits to their saved accounts don't change it. Staff may pay by another method
 * (DEC-149). After payment: how it was paid, the transaction ID and the proof (staff only).
 */
export function PayoutAccountSection({ payout }: { payout: StaffPayoutDetail }) {
  const { account } = payout;
  const isBank = account.method === "bank";
  const Icon = isBank ? Landmark : Smartphone;
  const wasPaid = payout.paidAt !== null;

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Pay to">
      <h2 className="mb-4 flex items-center gap-2 text-base">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        Pay to · {isBank ? (account.bankName ?? "Bank account") : "UPI ID"}
      </h2>
      <DetailList>
        <DetailRow label="Holder name">{account.holderName}</DetailRow>
        {isBank ? (
          <>
            <DetailRow label="Account number">
              <MaskedValue value={account.accountNumber} label="account number" />
            </DetailRow>
            <DetailRow label="IFSC">
              {account.ifsc ? <span className="font-mono">{account.ifsc}</span> : null}
            </DetailRow>
          </>
        ) : (
          <DetailRow label="UPI ID">
            <MaskedValue value={account.upiId} label="UPI ID" />
          </DetailRow>
        )}
      </DetailList>

      {wasPaid ? (
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold">Payment</h3>
          <DetailList>
            <DetailRow label="Paid by">
              {payout.paidMethod ? PAID_METHOD_LABELS[payout.paidMethod] : null}
            </DetailRow>
            <DetailRow label="Transaction ID">
              {payout.transactionId ? (
                <span className="font-mono break-all">{payout.transactionId}</span>
              ) : (
                <span className="text-muted-foreground">None (cash)</span>
              )}
            </DetailRow>
            <DetailRow label="Proof">
              <DocumentPreview url={payout.proofUrl} title={`Proof for ${payout.payoutNo}`} />
            </DetailRow>
          </DetailList>
        </div>
      ) : null}
    </section>
  );
}
