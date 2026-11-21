"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { useCountdown } from "@/hooks/auth/useCountdown";
import { authApi } from "@/lib/api/auth.api";
import { isApiError } from "@/lib/api/errors";
import { loadSignedInUser } from "@/lib/auth/session";
import { useAuthStore } from "@/stores/auth.store";

type Step = "phone" | "otp";

/** Seconds to wait from an OTP_RESEND_WAIT error, if the server sent it. */
function retryAfter(error: unknown): number | null {
  if (!isApiError(error) || error.code !== "OTP_RESEND_WAIT") return null;
  const details = error.details as { retryAfterSeconds?: unknown } | undefined;
  return typeof details?.retryAfterSeconds === "number" ? details.retryAfterSeconds : null;
}

function messageOf(error: unknown): string | null {
  if (!error) return null;
  return isApiError(error) ? error.message : "Something went wrong. Please try again.";
}

/**
 * The two login steps (phone → OTP) and their server calls.
 * `onSignedIn` runs after the token, profile and permissions are loaded.
 */
export function useLoginFlow(onSignedIn: () => void) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const { secondsLeft, restart } = useCountdown();

  const requestOtp = useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: (result, sentTo) => {
      setPhone(sentTo);
      setStep("otp");
      restart(result.resendAfterSeconds);
    },
    onError: (error, sentTo) => {
      const wait = retryAfter(error);
      // An OTP was already sent a moment ago: go to the OTP step and show the wait.
      if (wait !== null) {
        setPhone(sentTo);
        setStep("otp");
        restart(wait);
      }
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (otp: string) => {
      const result = await authApi.verifyOtp(phone, otp);
      useAuthStore.getState().setAccessToken(result.accessToken);
      await loadSignedInUser();
    },
    onSuccess: onSignedIn,
  });

  const phoneError = step === "phone" ? messageOf(requestOtp.error) : null;
  const otpError =
    messageOf(verifyOtp.error) ??
    (step === "otp" && retryAfter(requestOtp.error) === null ? messageOf(requestOtp.error) : null);

  return {
    step,
    phone,
    resendSecondsLeft: secondsLeft,
    phoneError,
    otpError,
    sendingOtp: requestOtp.isPending,
    verifying: verifyOtp.isPending || verifyOtp.isSuccess,
    sendOtp: (tenDigitPhone: string) => {
      verifyOtp.reset();
      requestOtp.mutate(tenDigitPhone);
    },
    resendOtp: () => {
      verifyOtp.reset();
      requestOtp.mutate(phone);
    },
    verify: (otp: string) => verifyOtp.mutate(otp),
    changeNumber: () => {
      requestOtp.reset();
      verifyOtp.reset();
      setStep("phone");
    },
    /** The person is typing a new number: an old server message no longer applies. */
    clearPhoneError: () => {
      if (requestOtp.isError) requestOtp.reset();
    },
    /** The person is typing a new code: an old "wrong OTP" no longer applies. */
    clearOtpError: () => {
      if (verifyOtp.isError) verifyOtp.reset();
      if (requestOtp.isError && retryAfter(requestOtp.error) === null) requestOtp.reset();
    },
    /** Back to an empty phone step (the login page was left). */
    reset: () => {
      requestOtp.reset();
      verifyOtp.reset();
      setPhone("");
      setStep("phone");
      restart(0);
    },
  };
}
