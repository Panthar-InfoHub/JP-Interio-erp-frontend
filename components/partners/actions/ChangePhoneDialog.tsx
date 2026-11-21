"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePartnerActions } from "@/hooks/partners/usePartnerActions";
import { formatPhone, toTenDigitMobile } from "@/lib/format/phone";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import type { Partner360 } from "@/types/partner";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .refine((value) => toTenDigitMobile(value) !== null, "Enter a valid 10-digit mobile number."),
});

interface ChangePhoneDialogProps {
  partner: Partner360;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Change a partner's mobile (DEC-074, DEC-242): type the new number once, then confirm
 * "old → new". No OTP; the partner is logged out of every device.
 */
export function ChangePhoneDialog({ partner, open, onOpenChange }: ChangePhoneDialogProps) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const { changePhone } = usePartnerActions(partner.partnerId);
  const form = useForm<{ phone: string }>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "" },
  });
  const oldPhone = partner.basicInfo?.phone ?? "";

  const close = (next: boolean) => {
    if (!next) {
      setConfirming(null);
      form.reset({ phone: "" });
    }
    onOpenChange(next);
  };

  const onSubmit = confirming
    ? (event: React.FormEvent) => {
        event.preventDefault();
        changePhone.mutate(confirming, {
          onSuccess: (reply) => {
            toast.success(
              reply.message ?? "Mobile number changed. The partner has been logged out.",
            );
            close(false);
          },
          onError: (error) => {
            setConfirming(null);
            if (!applyServerFieldErrors(error, form.setError, ["phone"])) {
              form.setError("phone", { message: errorMessage(error) });
            }
          },
        });
      }
    : form.handleSubmit(({ phone }) => {
        const tenDigits = toTenDigitMobile(phone)!;
        if (`91${tenDigits}` === oldPhone) {
          form.setError("phone", { message: "This is already the partner's number." });
          return;
        }
        setConfirming(tenDigits);
      });

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title={confirming ? "Confirm the new mobile number" : "Change mobile number"}
      description={
        confirming ? undefined : "No OTP is sent. Check the number with the partner before saving."
      }
      submitLabel={confirming ? "Yes, change it" : "Continue"}
      pending={changePhone.isPending}
      onSubmit={onSubmit}
    >
      {confirming ? (
        <div className="flex flex-col gap-3 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold tabular-nums">
            <span className="text-muted-foreground line-through">{formatPhone(oldPhone)}</span>
            <span aria-hidden>→</span>
            <span>{formatPhone(confirming)}</span>
          </p>
          <p className="flex gap-2 rounded-lg bg-warning/10 p-3 text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            The partner will be logged out of every device and must log in again with the new
            number. The old number becomes free.
          </p>
          <button
            type="button"
            className="self-start text-sm font-semibold text-primary hover:underline"
            onClick={() => setConfirming(null)}
            disabled={changePhone.isPending}
          >
            Go back and edit the number
          </button>
        </div>
      ) : (
        <Field data-invalid={Boolean(form.formState.errors.phone)}>
          <FieldLabel htmlFor="new-phone">New mobile number</FieldLabel>
          <p className="text-xs text-muted-foreground">Now: {formatPhone(oldPhone)}</p>
          <Input
            id="new-phone"
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            autoComplete="off"
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone")}
          />
          <FieldError errors={[form.formState.errors.phone]} />
        </Field>
      )}
    </FormDialog>
  );
}
