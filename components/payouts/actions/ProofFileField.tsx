"use client";

import { ExternalLink, FileText, Paperclip, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { acceptFor, UPLOAD_RULES } from "@/config/uploads";
import { useFileUpload } from "@/hooks/files/useFileUpload";
import { checkFile } from "@/lib/files/upload";
import { errorMessage } from "@/lib/forms/serverErrors";

function isPdf(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

interface ProofFileFieldProps {
  /** The proof's public link, or null for none. */
  value: string | null;
  onChange: (url: string | null) => void;
  /** True while a file is uploading: the form must wait (DEC-254). */
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
}

/**
 * Optional payment proof (upload purpose `payout_proof`: PDF or photo, up to 5 MB,
 * DEC-155). A chosen file uploads at once with a progress bar, then shows a small
 * preview (or the PDF) with Remove (DEC-254). Only staff see the proof.
 */
export function ProofFileField({ value, onChange, onBusyChange, disabled }: ProofFileFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useFileUpload("payout_proof");
  const [problem, setProblem] = useState<string | null>(null);
  const busy = upload.isPending;

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    const fileProblem = checkFile("payout_proof", file);
    if (fileProblem) {
      setProblem(fileProblem);
      return;
    }
    setProblem(null);
    upload.mutate(file, {
      onSuccess: (url) => onChange(url),
      onError: (error) => setProblem(errorMessage(error)),
    });
  };

  return (
    <Field data-invalid={Boolean(problem)}>
      <FieldLabel htmlFor={inputId}>Proof (optional)</FieldLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={acceptFor("payout_proof")}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Let the same file be picked again after Remove.
          event.target.value = "";
        }}
      />

      {busy ? (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Uploading the proof"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={upload.progress}
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Uploading… {upload.progress}%</p>
        </div>
      ) : value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-2">
          {isPdf(value) ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <FileText className="size-4" aria-hidden />
              PDF file <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : (
            <a href={value} target="_blank" rel="noopener noreferrer" aria-label="Open the proof">
              {/* Public R2 photo; a plain lazy <img> keeps it simple. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Payment proof"
                decoding="async"
                className="h-16 w-24 rounded-md border bg-muted object-cover"
              />
            </a>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={disabled}
            onClick={() => {
              setProblem(null);
              onChange(null);
            }}
          >
            <Trash2 data-icon="inline-start" />
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip data-icon="inline-start" />
          Choose file
        </Button>
      )}

      <FieldDescription>
        {UPLOAD_RULES.payout_proof.typesLabel}, up to 5 MB. Only staff see it.
      </FieldDescription>
      <FieldError errors={problem ? [{ message: problem }] : []} />
    </Field>
  );
}
