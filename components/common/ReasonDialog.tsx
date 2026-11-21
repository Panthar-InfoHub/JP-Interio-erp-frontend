"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Label above the box, e.g. "Reason" or "Note for the partner". */
  label?: string;
  /** Same limits as the server for this action (e.g. 10 – 500). */
  minLength: number;
  maxLength: number;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  /** Gets the trimmed text. */
  onConfirm: (reason: string) => void;
  /** One-click reasons that fill the box (the text can still be edited). */
  suggestions?: readonly string[];
}

/**
 * An action that needs a written reason (decline a payout, reject KYC, resolve a
 * ticket …). Checks the length here; the server checks it again.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  label = "Reason",
  minLength,
  maxLength,
  confirmLabel,
  destructive = false,
  pending = false,
  onConfirm,
  suggestions = [],
}: ReasonDialogProps) {
  const schema = useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(minLength, `Write at least ${minLength} characters.`)
          .max(maxLength, `At most ${maxLength} characters.`),
      }),
    [minLength, maxLength],
  );

  const form = useForm<{ reason: string }>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });
  const length = useWatch({ control: form.control, name: "reason" }).trim().length;
  const error = form.formState.errors.reason;

  // Every opening starts with an empty box.
  useEffect(() => {
    if (open) form.reset({ reason: "" });
  }, [open, form]);

  const submit = form.handleSubmit(({ reason }) => onConfirm(reason.trim()));

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent className="sm:max-w-md">
        <form noValidate onSubmit={submit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
          </AlertDialogHeader>

          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="reason-text">{label}</FieldLabel>
            {suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5" aria-label="Quick reasons">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      form.setValue("reason", suggestion, {
                        shouldValidate: form.formState.isSubmitted,
                        shouldDirty: true,
                      })
                    }
                    className="rounded-full border px-2.5 py-1 text-left text-xs hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
            <Textarea
              id="reason-text"
              rows={4}
              maxLength={maxLength}
              aria-invalid={Boolean(error)}
              disabled={pending}
              {...form.register("reason")}
            />
            <FieldDescription className="text-right tabular-nums">
              {length} / {maxLength}
            </FieldDescription>
            <FieldError errors={[error]} />
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
