"use client";

import { ScanSearch } from "lucide-react";
import { useId, useRef, useState } from "react";

import { QrCodeLookupDialog } from "@/components/qr-batches/lookup/QrCodeLookupDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useQrCodeLookup } from "@/hooks/qr/useQrBatches";
import type { QrCodeLookup } from "@/lib/api/qr.api";
import { isApiError } from "@/lib/api/errors";
import { errorMessage } from "@/lib/forms/serverErrors";

/** The server's own path limit for a code or link. */
const MAX_LENGTH = 300;

/**
 * "Look up a code" (`qr.view`, DEC-277): paste a code or the full QR link; the server
 * reads either. Found → the full story in a pop-up, and on close the box empties for the
 * next code. Not found (or any other failure) → red text under the box.
 */
export function QrCodeLookupBox() {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const lookup = useQrCodeLookup();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrCodeLookup | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) {
      setError("Paste or type a code first.");
      return;
    }
    setError(null);
    lookup.mutate(text, {
      onSuccess: (found) => setResult(found),
      onError: (failure) =>
        setError(
          isApiError(failure) && failure.status === 404
            ? "QR code not found. Check the code or link and try again."
            : errorMessage(failure),
        ),
    });
  };

  return (
    <>
      <form
        noValidate
        onSubmit={submit}
        className="mb-4 rounded-xl border bg-card p-3 shadow-sm sm:p-4"
        aria-label="Look up a code"
      >
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">
          Look up a code
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste a code or QR link, e.g. K7M2QX4RTB2A"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_LENGTH}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="sm:max-w-md"
          />
          <Button type="submit" variant="outline" disabled={lookup.isPending}>
            {lookup.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ScanSearch data-icon="inline-start" />
            )}
            Look up
          </Button>
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      <QrCodeLookupDialog
        result={result}
        returnFocusTo={inputRef}
        onClose={() => {
          setResult(null);
          setValue("");
        }}
      />
    </>
  );
}
