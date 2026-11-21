"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { formatPhone } from "@/lib/format/phone";

/** The apps are built for a 6-digit code (`otp.length` is read-only, DEC-036). */
const OTP_LENGTH = 6;

interface OtpStepProps {
  phone: string;
  pending: boolean;
  resending: boolean;
  serverError: string | null;
  resendSecondsLeft: number;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onChangeNumber: () => void;
  /** Called on every change, so an old "wrong OTP" disappears while typing. */
  onEdit: () => void;
}

/** Step 2: the 6-digit OTP. Sends by itself once all 6 digits are typed. */
export function OtpStep({
  phone,
  pending,
  resending,
  serverError,
  resendSecondsLeft,
  onSubmit,
  onResend,
  onChangeNumber,
  onEdit,
}: OtpStepProps) {
  const [otp, setOtp] = useState("");
  const complete = otp.length === OTP_LENGTH;

  const submit = (value: string) => {
    if (value.length === OTP_LENGTH && !pending) onSubmit(value);
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit(otp);
      }}
    >
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-foreground">{formatPhone(phone)}</span>.
      </p>

      <Field data-invalid={Boolean(serverError)}>
        <FieldLabel htmlFor="otp">OTP</FieldLabel>
        <InputOTP
          id="otp"
          maxLength={OTP_LENGTH}
          inputMode="numeric"
          pattern="^\d+$"
          autoComplete="one-time-code"
          autoFocus
          value={otp}
          onChange={(value) => {
            setOtp(value);
            onEdit();
          }}
          onComplete={submit}
          disabled={pending}
          aria-invalid={Boolean(serverError)}
          containerClassName="justify-center sm:justify-start"
        >
          <InputOTPGroup>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} className="size-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <FieldError>{serverError}</FieldError>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={!complete || pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Log in
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Button type="button" variant="ghost" size="sm" onClick={onChangeNumber}>
          <ArrowLeft data-icon="inline-start" />
          Change number
        </Button>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => {
            setOtp("");
            onResend();
          }}
          disabled={resendSecondsLeft > 0 || resending}
        >
          {resendSecondsLeft > 0 ? `Resend OTP in ${resendSecondsLeft}s` : "Resend OTP"}
        </Button>
      </div>
    </form>
  );
}
