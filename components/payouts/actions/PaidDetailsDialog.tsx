"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { ProofFileField } from "@/components/payouts/actions/ProofFileField";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatRupees } from "@/lib/format/number";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { PAID_METHOD_LABELS } from "@/lib/labels/payout";
import { cn } from "@/lib/utils";
import type {
  MarkPaidInput,
  PaidDetailsChanges,
  PaidMethod,
  StaffPayoutDetail,
} from "@/types/payout";

const METHODS = Object.keys(PAID_METHOD_LABELS) as PaidMethod[];

// The server's rule (DEC-148): a transaction ID for UPI / bank transfer, none for cash.
const schema = z
  .object({
    method: z.enum(["cash", "upi", "bank_transfer"]),
    transactionId: z.string().trim().max(100, "At most 100 characters."),
  })
  .superRefine((values, ctx) => {
    if (values.method !== "cash" && values.transactionId.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["transactionId"],
        message: "Enter the transaction ID (UTR / UPI reference).",
      });
    }
  });

type Values = z.infer<typeof schema>;

interface PaidDetailsDialogProps {
  /** "pay" = Mark paid (approved → paid); "correct" = fix the details of a paid payout. */
  mode: "pay" | "correct";
  payout: StaffPayoutDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onMarkPaid: (input: MarkPaidInput) => Promise<unknown>;
  onCorrect: (changes: PaidDetailsChanges) => Promise<unknown>;
}

/**
 * Mark paid, or correct the paid details (DEC-155, DEC-254). The method starts as the
 * account's (UPI ID → UPI, bank account → bank transfer); staff may pick another one,
 * cash too. Optional proof file. The form waits while the proof uploads. Mounted only
 * while open, so every opening starts fresh.
 */
export function PaidDetailsDialog({
  mode,
  payout,
  open,
  onOpenChange,
  pending,
  onMarkPaid,
  onCorrect,
}: PaidDetailsDialogProps) {
  const isPay = mode === "pay";
  const startMethod: PaidMethod = isPay
    ? payout.account.method === "upi"
      ? "upi"
      : "bank_transfer"
    : (payout.paidMethod ?? "upi");
  const startProof = isPay ? null : payout.proofUrl;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      method: startMethod,
      transactionId: isPay ? "" : (payout.transactionId ?? ""),
    },
  });
  const method = useWatch({ control: form.control, name: "method" });
  const [proofUrl, setProofUrl] = useState<string | null>(startProof);
  const [uploading, setUploading] = useState(false);
  const [nothingChanged, setNothingChanged] = useState(false);
  const onBusyChange = useCallback((busy: boolean) => setUploading(busy), []);

  // The caller handles every failure except field problems, which it passes back here.
  const placeErrors = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, ["method", "transactionId"])) {
      toast.error(errorMessage(error));
    }
  };

  const submit = form.handleSubmit(async (values) => {
    if (uploading) return;
    const transactionId = values.method === "cash" ? undefined : values.transactionId;

    if (isPay) {
      await onMarkPaid({
        method: values.method,
        ...(transactionId && { transactionId }),
        ...(proofUrl && { proofUrl }),
      }).catch(placeErrors);
      return;
    }

    // Correct: send only what really changes (the server refuses an empty change).
    const changes: PaidDetailsChanges = {};
    if (values.method !== payout.paidMethod) changes.method = values.method;
    const nextTxn = transactionId ?? null;
    if (nextTxn !== payout.transactionId) changes.transactionId = nextTxn;
    if (proofUrl !== payout.proofUrl) changes.proofUrl = proofUrl;
    if (Object.keys(changes).length === 0) {
      setNothingChanged(true);
      return;
    }
    await onCorrect(changes).catch(placeErrors);
  });

  const busy = pending || uploading;
  const txnError = form.formState.errors.transactionId;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isPay ? `Mark ${payout.payoutNo} paid` : `Correct the paid details`}
      description={
        isPay
          ? `Pay ${formatRupees(payout.amount)} outside the platform first, then save it here. The paid time is now.`
          : "Fix a wrong method, transaction ID or proof. No points move."
      }
      submitLabel={uploading ? "Uploading…" : isPay ? "Mark paid" : "Save changes"}
      pending={busy}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="method"
          render={({ field }) => (
            <Field>
              <FieldLabel id="paid-method-label">Paid by</FieldLabel>
              <div
                role="radiogroup"
                aria-labelledby="paid-method-label"
                className="inline-flex flex-wrap gap-1 self-start rounded-lg border p-0.5"
              >
                {METHODS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === value}
                    disabled={busy}
                    onClick={() => {
                      setNothingChanged(false);
                      field.onChange(value);
                      if (value === "cash") form.clearErrors("transactionId");
                    }}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50",
                      field.value === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {PAID_METHOD_LABELS[value]}
                  </button>
                ))}
              </div>
              {field.value !== startMethod && isPay ? (
                <FieldDescription>
                  The partner chose{" "}
                  {payout.account.method === "upi" ? "a UPI ID" : "a bank account"}; paying another
                  way is allowed.
                </FieldDescription>
              ) : null}
            </Field>
          )}
        />

        {method === "cash" ? (
          <p className="text-sm text-muted-foreground">Cash has no transaction ID.</p>
        ) : (
          <Field data-invalid={Boolean(txnError)}>
            <FieldLabel htmlFor="paid-txn">Transaction ID</FieldLabel>
            <Input
              id="paid-txn"
              autoComplete="off"
              maxLength={100}
              placeholder={method === "upi" ? "UPI reference number" : "UTR number"}
              aria-invalid={Boolean(txnError)}
              disabled={busy}
              {...form.register("transactionId", { onChange: () => setNothingChanged(false) })}
            />
            <FieldError errors={[txnError]} />
          </Field>
        )}

        <ProofFileField
          value={proofUrl}
          onChange={(url) => {
            setNothingChanged(false);
            setProofUrl(url);
          }}
          onBusyChange={onBusyChange}
          disabled={pending}
        />

        {nothingChanged ? (
          <p className="text-sm text-destructive" role="alert">
            Nothing has changed yet.
          </p>
        ) : null}
      </div>
    </FormDialog>
  );
}
