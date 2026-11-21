"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toTenDigitMobile } from "@/lib/format/phone";

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((value) => toTenDigitMobile(value) !== null, {
      message: "Enter a valid 10-digit mobile number.",
    }),
});

type PhoneForm = z.infer<typeof phoneSchema>;

interface PhoneStepProps {
  defaultPhone: string;
  pending: boolean;
  serverError: string | null;
  /** Gets the cleaned 10-digit number. */
  onSubmit: (phone: string) => void;
  /** Called on every change, so an old server message disappears while typing. */
  onEdit: () => void;
}

/** Step 1: the staff member's mobile number. */
export function PhoneStep({
  defaultPhone,
  pending,
  serverError,
  onSubmit,
  onEdit,
}: PhoneStepProps) {
  const form = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: defaultPhone },
  });
  const fieldError = form.formState.errors.phone;

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(({ phone }) => onSubmit(toTenDigitMobile(phone) ?? phone))}
    >
      <Field data-invalid={Boolean(fieldError || serverError)}>
        <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            +91
          </span>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            autoFocus
            className="rounded-l-none"
            aria-invalid={Boolean(fieldError || serverError)}
            {...form.register("phone", { onChange: onEdit })}
          />
        </div>
        <FieldError>{fieldError?.message ?? serverError}</FieldError>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Get OTP
        {pending ? null : <ArrowRight data-icon="inline-end" />}
      </Button>
    </form>
  );
}
