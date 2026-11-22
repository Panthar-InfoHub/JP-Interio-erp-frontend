"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVoidQrBatch } from "@/hooks/qr/useQrBatches";
import type { QrBatchDetail } from "@/lib/api/qr.api";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { formatCount, formatPoints } from "@/lib/format/number";

const REASON_MIN = 10;
const REASON_MAX = 500;

/** Any case, spaces ignored (DEC-276). */
const normalise = (value: string) => value.replace(/\s+/g, "").toUpperCase();

/**
 * Void a whole batch (`qr.void`, DEC-274, DEC-276): permanent, no undo. Shows how many
 * unused codes die and how many scanned codes keep their points; needs a reason (10 – 500,
 * same as the server) and the batch number typed before "Void batch" works. Mounted only
 * while open, so every opening starts fresh.
 */
export function VoidBatchDialog({
  batch,
  open,
  onOpenChange,
}: {
  batch: QrBatchDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const voidBatch = useVoidQrBatch();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    reason: z
      .string()
      .trim()
      .min(REASON_MIN, `Write at least ${REASON_MIN} characters.`)
      .max(REASON_MAX, `At most ${REASON_MAX} characters.`),
    confirmText: z
      .string()
      .refine(
        (value) => normalise(value) === normalise(batch.batchNo),
        `Type ${batch.batchNo} to confirm.`,
      ),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", confirmText: "" },
  });
  const { errors } = form.formState;
  const [reason, confirmText] = useWatch({
    control: form.control,
    name: ["reason", "confirmText"],
  });
  const typedOk = normalise(confirmText) === normalise(batch.batchNo);
  const { active, scanned } = batch.codeCounts;

  const submit = form.handleSubmit((values) => {
    setFormError(null);
    voidBatch.mutate(
      { id: batch.id, reason: values.reason.trim().replace(/\s+/g, " ") },
      {
        onSuccess: (reply) => {
          if (reply.data.changed) toast.success(reply.message ?? "Batch voided");
          else toast.info(reply.message ?? "Batch is already voided");
          onOpenChange(false);
        },
        onError: (error) => {
          if (!applyServerFieldErrors(error, form.setError, ["reason"])) {
            setFormError(errorMessage(error));
          }
        },
      },
    );
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Void ${batch.batchNo}?`}
      description="This can't be undone. To print codes for this product again, make a new batch."
      submitLabel="Void batch"
      destructive
      submitDisabled={!typedOk}
      pending={voidBatch.isPending}
      onSubmit={submit}
      formError={formError}
      size="md"
    >
      <FieldGroup>
        <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <ul className="grid gap-1">
            <li>
              <strong className="tabular-nums">{formatCount(active)}</strong> unused{" "}
              {active === 1 ? "code" : "codes"} will be voided and can never be scanned.
            </li>
            <li>
              <strong className="tabular-nums">{formatCount(scanned)}</strong> already scanned{" "}
              {scanned === 1 ? "code keeps its" : "codes keep their"} points (
              {formatPoints(scanned * batch.pointsPerCode)}).
            </li>
            <li>The ZIP can&apos;t be downloaded any more.</li>
          </ul>
        </div>

        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="void-reason">Reason</FieldLabel>
          <Textarea
            id="void-reason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder="e.g. Print run damaged at the vendor"
            aria-invalid={Boolean(errors.reason)}
            disabled={voidBatch.isPending}
            {...form.register("reason")}
          />
          <FieldDescription className="text-right tabular-nums">
            {reason.trim().length} / {REASON_MAX}
          </FieldDescription>
          <FieldError errors={[errors.reason]} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmText)}>
          <FieldLabel htmlFor="void-confirm">
            Type <span className="font-mono font-semibold">{batch.batchNo}</span> to confirm
          </FieldLabel>
          <Input
            id="void-confirm"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(errors.confirmText)}
            disabled={voidBatch.isPending}
            {...form.register("confirmText")}
          />
          {typedOk ? (
            <FieldDescription className="text-destructive">
              Matches. &ldquo;Void batch&rdquo; will void it for good.
            </FieldDescription>
          ) : null}
          <FieldError errors={[errors.confirmText]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
