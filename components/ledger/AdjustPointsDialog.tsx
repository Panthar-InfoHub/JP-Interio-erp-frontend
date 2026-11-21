"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdjustPoints } from "@/hooks/ledger/useLedger";
import { isApiError } from "@/lib/api/errors";
import { formatPoints } from "@/lib/format/number";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { cn } from "@/lib/utils";

/** The server's reason limits (ledger.service.ts ADJUST_REASON_MIN / MAX). */
const REASON_MIN = 10;
const REASON_MAX = 500;

const DIRECTIONS = [
  { value: "credit", label: "Add points" },
  { value: "debit", label: "Take points away" },
] as const;

const schema = z.object({
  direction: z.enum(["credit", "debit"]),
  points: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number of points.")
    .refine((value) => Number(value) > 0, "Enter more than 0 points.")
    .refine((value) => Number.isSafeInteger(Number(value)), "That number is too large."),
  reason: z
    .string()
    .trim()
    .min(REASON_MIN, `Write at least ${REASON_MIN} characters.`)
    .max(REASON_MAX, `At most ${REASON_MAX} characters.`),
});

type Values = z.infer<typeof schema>;

interface AdjustPointsDialogProps {
  partnerId: string;
  partnerName: string;
  /** Points available now (the preview starts from it). */
  available: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add or take away points by hand (`ledger.adjust`: Admin and Rewards Sub-Admin, DEC-252,
 * DEC-256). Live preview "available now → after"; one Save, locked while saving because
 * the server has no double-click protection (DEC-135). A debit never goes below 0 and
 * never touches held points (DEC-128). The reason is shown to the partner. Mounted only
 * while open, so every opening starts fresh.
 */
export function AdjustPointsDialog({
  partnerId,
  partnerName,
  available,
  open,
  onOpenChange,
}: AdjustPointsDialogProps) {
  const adjust = useAdjustPoints(partnerId);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { direction: "credit", points: "", reason: "" },
  });
  const [direction, pointsText, reasonText] = useWatch({
    control: form.control,
    name: ["direction", "points", "reason"],
  });

  const points = /^\d+$/.test(pointsText.trim()) ? Number(pointsText.trim()) : 0;
  const after = direction === "credit" ? available + points : available - points;
  const tooMuch = direction === "debit" && points > available;
  const reasonLength = reasonText.trim().length;

  const submit = form.handleSubmit((values) => {
    if (adjust.isPending) return;
    const amount = Number(values.points);
    if (values.direction === "debit" && amount > available) {
      form.setError("points", {
        message: `Only ${formatPoints(available)} are available, so you can take at most that.`,
      });
      return;
    }
    adjust.mutate(
      { direction: values.direction, points: amount, reason: values.reason },
      {
        onSuccess: (reply) => {
          toast.success(
            reply.message ?? (values.direction === "credit" ? "Points added" : "Points taken away"),
          );
          onOpenChange(false);
        },
        onError: (error) => {
          // Not enough points (someone else moved them first): show it under the points.
          if (isApiError(error) && error.code === "INSUFFICIENT_POINTS") {
            form.setError("points", { message: error.message });
            return;
          }
          if (applyServerFieldErrors(error, form.setError, ["direction", "points", "reason"])) {
            return;
          }
          toast.error(errorMessage(error));
          // No wallet / frozen: nothing can be done here.
          if (isApiError(error) && (error.code === "NO_WALLET" || error.code === "WALLET_FROZEN")) {
            onOpenChange(false);
          }
        },
      },
    );
  });

  const errors = form.formState.errors;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Adjust points for ${partnerName}`}
      description="The partner sees the reason in their app, not your name."
      submitLabel={direction === "credit" ? "Add points" : "Take points away"}
      destructive={direction === "debit"}
      pending={adjust.isPending}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="direction"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="Add or take away"
              className="inline-flex flex-wrap gap-1 self-start rounded-lg border p-0.5"
            >
              {DIRECTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === item.value}
                  disabled={adjust.isPending}
                  onClick={() => {
                    field.onChange(item.value);
                    form.clearErrors("points");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50",
                    field.value === item.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        />

        <Field data-invalid={Boolean(errors.points)}>
          <FieldLabel htmlFor="adjust-points">Points</FieldLabel>
          <Input
            id="adjust-points"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 500"
            aria-invalid={Boolean(errors.points)}
            disabled={adjust.isPending}
            {...form.register("points")}
          />
          <FieldError errors={[errors.points]} />
        </Field>

        <div
          className="flex flex-wrap items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm tabular-nums"
          aria-live="polite"
        >
          <span className="text-muted-foreground">Available now</span>
          <span className="font-semibold">{formatPoints(available)}</span>
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">after</span>
          <span className={cn("font-semibold", tooMuch && "text-destructive")}>
            {tooMuch ? "not enough points" : formatPoints(after)}
          </span>
        </div>

        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="adjust-reason">Reason (shown to the partner)</FieldLabel>
          <Textarea
            id="adjust-reason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder="e.g. Diwali bonus for top carpenters"
            aria-invalid={Boolean(errors.reason)}
            disabled={adjust.isPending}
            {...form.register("reason")}
          />
          <FieldDescription className="text-right tabular-nums">
            {reasonLength} / {REASON_MAX}
          </FieldDescription>
          <FieldError errors={[errors.reason]} />
        </Field>
      </div>
    </FormDialog>
  );
}
