"use client";

import { Banknote, Check, PencilLine, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { PaidDetailsDialog } from "@/components/payouts/actions/PaidDetailsDialog";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import { usePayoutActions } from "@/hooks/payouts/usePayouts";
import { isApiError } from "@/lib/api/errors";
import { formatRupees } from "@/lib/format/number";
import { errorMessage } from "@/lib/forms/serverErrors";
import type { ApiSuccess } from "@/types/api-response";
import type { PayoutStepResult, StaffPayoutDetail } from "@/types/payout";

/** One-click reasons (DEC-254); the partner sees them in their app. */
const DECLINE_REASONS = [
  "The bank / UPI details look wrong. Please check them and ask again.",
  "Points under review. Please contact your ASM.",
] as const;
const FAILED_REASONS = [
  "The bank returned the money. Please check your account details.",
  "The UPI transfer failed. Please check your UPI ID.",
] as const;

/** The server's limits for decline / failed reasons. */
const REASON_MIN = 10;
const REASON_MAX = 500;

type Dialog = "approve" | "decline" | "pay" | "correct" | "fail" | null;

/**
 * The payout's step buttons in a bar that stays visible at the bottom (DEC-254). The
 * buttons follow the status and the person's permissions (the server checks again):
 *   requested → Decline · Approve          (payouts.approve)
 *   approved  → Decline (payouts.approve) · Mark paid (payouts.mark_paid)
 *   paid      → Mark failed (payouts.approve) · Correct paid details (payouts.mark_paid)
 * A frozen wallet blocks every step that moves points; correcting still works (DEC-149).
 * After a step the page stays and refreshes to the new status.
 */
export function PayoutActionBar({ payout }: { payout: StaffPayoutDetail }) {
  const can = useCan();
  const actions = usePayoutActions(payout.id, payout.partner.id);
  const [dialog, setDialog] = useState<Dialog>(null);

  const frozen = payout.partnerContext.wallet?.frozen === true;
  const canApprove = can("payouts.approve");
  const canPay = can("payouts.mark_paid");
  const { status } = payout;

  const showDecline = canApprove && (status === "requested" || status === "approved");
  const showApprove = canApprove && status === "requested";
  const showPay = canPay && status === "approved";
  const showFail = canApprove && status === "paid";
  const showCorrect = canPay && status === "paid";
  if (!showDecline && !showApprove && !showPay && !showFail && !showCorrect) return null;

  const close = () => setDialog(null);

  const done = (reply: ApiSuccess<PayoutStepResult>, fallback: string) => {
    if (reply.data.alreadyDone) toast.info(reply.message ?? "Nothing changed.");
    else toast.success(reply.message ?? fallback);
    close();
  };

  // Someone else moved it first (PAYOUT_WRONG_STATUS) or the wallet froze (WALLET_FROZEN):
  // show the server's message and reload the payout.
  const failed = (error: unknown) => {
    toast.error(errorMessage(error));
    if (
      isApiError(error) &&
      (error.code === "PAYOUT_WRONG_STATUS" || error.code === "WALLET_FROZEN")
    ) {
      close();
      void actions.refresh();
    }
  };

  // For the paid-details form: field problems go back to the form, everything else here.
  const run = (promise: Promise<ApiSuccess<PayoutStepResult>>, fallback: string) =>
    promise.then(
      (reply) => done(reply, fallback),
      (error: unknown) => {
        if (isApiError(error) && error.code === "VALIDATION_ERROR") throw error;
        failed(error);
      },
    );

  const partnerName = payout.partner.name ?? "the partner";
  const amount = formatRupees(payout.amount);
  const frozenTitle = frozen ? "The partner's wallet is frozen: this payout waits." : undefined;

  return (
    <>
      {/* Sticky at the bottom of the page content (like KYC review), never over the sidebar. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t bg-background/95 backdrop-blur sm:-mx-6">
        <div className="flex w-full flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6">
          {frozen ? (
            <p className="mr-auto flex items-center gap-1.5 text-sm text-warning">
              <TriangleAlert className="size-4 shrink-0" aria-hidden />
              Wallet frozen: this payout waits.
            </p>
          ) : null}

          {showFail ? (
            <Button
              variant="destructive"
              disabled={frozen}
              title={frozenTitle}
              onClick={() => setDialog("fail")}
            >
              <X data-icon="inline-start" />
              Mark failed
            </Button>
          ) : null}
          {showCorrect ? (
            <Button variant="outline" onClick={() => setDialog("correct")}>
              <PencilLine data-icon="inline-start" />
              Correct paid details
            </Button>
          ) : null}
          {showDecline ? (
            <Button
              variant="outline"
              disabled={frozen}
              title={frozenTitle}
              onClick={() => setDialog("decline")}
            >
              <X data-icon="inline-start" />
              Decline
            </Button>
          ) : null}
          {showApprove ? (
            <Button disabled={frozen} title={frozenTitle} onClick={() => setDialog("approve")}>
              <Check data-icon="inline-start" />
              Approve
            </Button>
          ) : null}
          {showPay ? (
            <Button disabled={frozen} title={frozenTitle} onClick={() => setDialog("pay")}>
              <Banknote data-icon="inline-start" />
              Mark paid
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={dialog === "approve"}
        onOpenChange={(next) => !next && close()}
        title="Approve this payout?"
        description={`Approve ${payout.payoutNo} for ${amount} to ${partnerName}? The points stay held until it is marked paid.`}
        confirmLabel="Approve"
        pending={actions.approve.isPending}
        onConfirm={() =>
          actions.approve.mutate(undefined, {
            onSuccess: (reply) => done(reply, "Payout approved"),
            onError: failed,
          })
        }
      />

      <ReasonDialog
        open={dialog === "decline"}
        onOpenChange={(next) => !next && close()}
        title={`Decline ${payout.payoutNo}?`}
        description={`The ${amount} goes back to ${partnerName}'s points. This is final. The reason is shown to the partner in their app.`}
        label="Reason (shown to the partner)"
        minLength={REASON_MIN}
        maxLength={REASON_MAX}
        suggestions={DECLINE_REASONS}
        confirmLabel="Decline"
        destructive
        pending={actions.decline.isPending}
        onConfirm={(reason) =>
          actions.decline.mutate(reason, {
            onSuccess: (reply) => done(reply, "Payout declined"),
            onError: failed,
          })
        }
      />

      <ReasonDialog
        open={dialog === "fail"}
        onOpenChange={(next) => !next && close()}
        title={`Mark ${payout.payoutNo} failed?`}
        description={
          <>
            Only if the money did not reach the partner. <strong>This can&apos;t be undone:</strong>{" "}
            the points go back to {partnerName} and this payout can&apos;t be paid again (they can
            ask for a new one). The reason is shown to the partner.
          </>
        }
        label="Reason (shown to the partner)"
        minLength={REASON_MIN}
        maxLength={REASON_MAX}
        suggestions={FAILED_REASONS}
        confirmLabel="Mark failed"
        destructive
        pending={actions.markFailed.isPending}
        onConfirm={(reason) =>
          actions.markFailed.mutate(reason, {
            onSuccess: (reply) => done(reply, "Payout marked failed"),
            onError: failed,
          })
        }
      />

      {dialog === "pay" || dialog === "correct" ? (
        <PaidDetailsDialog
          mode={dialog}
          payout={payout}
          open
          onOpenChange={(next) => !next && close()}
          pending={actions.markPaid.isPending || actions.editPaidDetails.isPending}
          onMarkPaid={(input) => run(actions.markPaid.mutateAsync(input), "Payout marked paid")}
          onCorrect={(changes) =>
            run(actions.editPaidDetails.mutateAsync(changes), "Paid details corrected")
          }
        />
      ) : null}
    </>
  );
}
