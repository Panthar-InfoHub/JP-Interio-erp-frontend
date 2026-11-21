"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { OtpStep } from "@/components/auth/OtpStep";
import { PhoneStep } from "@/components/auth/PhoneStep";
import { BrandMark } from "@/components/brand/BrandMark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoginFlow } from "@/hooks/auth/useLoginFlow";
import { takeEndedReason } from "@/lib/auth/endedReason";
import { ensureSession } from "@/lib/auth/session";
import { useAuthStore } from "@/stores/auth.store";

/** Every login lands here, whatever page the person was on before (DEC-235). */
const AFTER_LOGIN = "/dashboard";

/** The login page: phone → OTP. A person who is already logged in goes straight on. */
export function LoginScreen() {
  const router = useRouter();
  const nextPath = AFTER_LOGIN;
  const status = useAuthStore((state) => state.status);
  const endedReason = useAuthStore((state) => state.endedReason);

  const goOn = () => {
    useAuthStore.getState().clearEndedReason();
    router.replace(nextPath);
  };
  const flow = useLoginFlow(goOn);

  // Next.js keeps a visited page alive (hidden) with its state. When the login page is
  // left, start it fresh for next time: phone step, no old messages (DEC-232).
  const resetRef = useRef(flow.reset);
  useLayoutEffect(() => {
    resetRef.current = flow.reset;
  });
  useLayoutEffect(() => () => resetRef.current(), []);

  // A session that just ended left its reason behind before the page reloaded.
  useEffect(() => {
    const reason = takeEndedReason();
    if (reason) useAuthStore.getState().setEndedReason(reason);
  }, []);

  // Opened /login with a live session (e.g. a bookmark): skip the form.
  useEffect(() => {
    if (status === "checking") void ensureSession();
  }, [status]);

  useEffect(() => {
    if (status === "signedIn" && !flow.verifying) router.replace(nextPath);
  }, [status, flow.verifying, nextPath, router]);

  if (status === "checking" || (status === "signedIn" && !flow.verifying)) {
    return <FullScreenLoader />;
  }

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-sm">
        <BrandMark className="mb-6 text-2xl" />

        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-xl">Log in</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            {flow.step === "phone"
              ? "Use the mobile number registered for the admin console."
              : "Enter the code to continue."}
          </p>

          {endedReason && flow.step === "phone" ? (
            <Alert className="mb-5">
              <Info />
              <AlertDescription>{endedReason}</AlertDescription>
            </Alert>
          ) : null}

          {flow.step === "phone" ? (
            <PhoneStep
              defaultPhone={flow.phone}
              pending={flow.sendingOtp}
              serverError={flow.phoneError}
              onSubmit={flow.sendOtp}
              onEdit={flow.clearPhoneError}
            />
          ) : (
            <OtpStep
              phone={flow.phone}
              pending={flow.verifying}
              resending={flow.sendingOtp}
              serverError={flow.otpError}
              resendSecondsLeft={flow.resendSecondsLeft}
              onSubmit={flow.verify}
              onResend={flow.resendOtp}
              onChangeNumber={flow.changeNumber}
              onEdit={flow.clearOtpError}
            />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          For Admin, Sub-Admin and Zonal Head accounts only.
        </p>
      </div>
    </main>
  );
}
