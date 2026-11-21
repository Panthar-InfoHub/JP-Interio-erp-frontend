"use client";

import { ImagePlus, RefreshCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { DocumentPreview } from "@/components/common/DocumentPreview";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { acceptFor, UPLOAD_RULES } from "@/config/uploads";
import { useFileUpload } from "@/hooks/files/useFileUpload";
import { checkFile } from "@/lib/files/upload";
import { errorMessage } from "@/lib/forms/serverErrors";

interface ProductImageFieldProps {
  /** The image's public link, or "" for none yet. */
  value: string;
  onChange: (url: string) => void;
  /** True while a file is uploading: the form must wait. */
  onBusyChange: (busy: boolean) => void;
  /** The form's own message (e.g. "Add the product image"). */
  error?: string;
  disabled?: boolean;
}

/**
 * The product's one image, required (upload purpose `product_image`: JPG / PNG / WebP,
 * up to 5 MB, DEC-113). A chosen file uploads at once with a progress bar, then shows a
 * preview with "Replace image". It can't be removed. The server deletes the old file only
 * after the product is saved with the new one.
 */
export function ProductImageField({
  value,
  onChange,
  onBusyChange,
  error,
  disabled,
}: ProductImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useFileUpload("product_image");
  const [problem, setProblem] = useState<string | null>(null);
  const busy = upload.isPending;

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    const fileProblem = checkFile("product_image", file);
    if (fileProblem) {
      setProblem(fileProblem);
      return;
    }
    setProblem(null);
    upload.mutate(file, {
      onSuccess: (url) => onChange(url),
      onError: (uploadError) => setProblem(errorMessage(uploadError)),
    });
  };

  const message = problem ?? error;

  return (
    <Field data-invalid={Boolean(message)}>
      <FieldLabel htmlFor={inputId}>Image</FieldLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={acceptFor("product_image")}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Let the same file be picked again.
          event.target.value = "";
        }}
      />

      {busy ? (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Uploading the image"
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
          <DocumentPreview url={value} title="Product image" thumbClassName="h-20 w-28" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <RefreshCw data-icon="inline-start" />
            Replace image
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
          <ImagePlus data-icon="inline-start" />
          Choose image
        </Button>
      )}

      <FieldDescription>
        One image, required. {UPLOAD_RULES.product_image.typesLabel}, up to 5 MB.
      </FieldDescription>
      <FieldError errors={message ? [{ message }] : []} />
    </Field>
  );
}
