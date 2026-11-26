"use client";

import { FileImage, ImagePlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { DocumentPreview } from "@/components/common/DocumentPreview";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { acceptFor, UPLOAD_RULES } from "@/config/uploads";
import { checkFile, uploadFile } from "@/lib/files/upload";
import { errorMessage } from "@/lib/forms/serverErrors";
import { cn } from "@/lib/utils";

/** Same limits as the server (DEC-177). */
export const TASK_PHOTOS_MIN = 1;
export const TASK_PHOTOS_MAX = 10;

interface PhotoItem {
  key: string;
  name: string;
  /** Browsers can't show HEIC / HEIF: a file icon instead (DEC-293). */
  previewable: boolean;
  progress: number;
  url: string | null;
  error: string | null;
}

interface TaskPhotosFieldProps {
  /** The uploaded photos' links, in the order picked. */
  onChange: (urls: string[]) => void;
  /** True while any photo is still uploading: the form must wait. */
  onBusyChange: (busy: boolean) => void;
  /** The form's own message (e.g. "Add at least one photo"). */
  error?: string;
  disabled?: boolean;
}

/**
 * Completion photos (upload purpose `task_photo`: JPG / PNG / WebP / HEIC, up to 5 MB, 1 – 10,
 * DEC-181, DEC-293). Each picked photo uploads at once with its own progress bar, then shows
 * a thumbnail; any can be removed (a failed one too). Files left in storage by a removed
 * photo are harmless (orphan uploads, STATUS notes).
 */
export function TaskPhotosField({ onChange, onBusyChange, error, disabled }: TaskPhotosFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [problem, setProblem] = useState<string | null>(null);

  const busy = items.some((item) => !item.url && !item.error);
  const uploaded = items.filter((item) => item.url).map((item) => item.url as string);
  const uploadedKey = uploaded.join("\n");

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    onChange(uploadedKey ? uploadedKey.split("\n") : []);
  }, [uploadedKey, onChange]);

  const patch = (key: string, change: Partial<PhotoItem>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...change } : item)),
    );

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = TASK_PHOTOS_MAX - items.length;
    const chosen = Array.from(files);
    setProblem(
      chosen.length > room
        ? `At most ${TASK_PHOTOS_MAX} photos: only the first ${Math.max(room, 0)} were added.`
        : null,
    );

    const added: PhotoItem[] = [];
    for (const file of chosen.slice(0, Math.max(room, 0))) {
      const fileProblem = checkFile("task_photo", file);
      const item: PhotoItem = {
        key: crypto.randomUUID(),
        name: file.name,
        previewable: !/hei[cf]$/i.test(file.type),
        progress: 0,
        url: null,
        error: fileProblem,
      };
      added.push(item);
      if (fileProblem) continue;
      uploadFile("task_photo", file, (percent) => patch(item.key, { progress: percent }))
        .then((url) => patch(item.key, { url, progress: 100 }))
        .catch((uploadError: unknown) => patch(item.key, { error: errorMessage(uploadError) }));
    }
    setItems((current) => [...current, ...added]);
  };

  const remove = (key: string) => setItems((current) => current.filter((item) => item.key !== key));

  const message = problem ?? error;
  const full = items.length >= TASK_PHOTOS_MAX;

  return (
    <Field data-invalid={Boolean(message)}>
      <FieldLabel htmlFor={inputId}>Photos</FieldLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={acceptFor("task_photo")}
        className="sr-only"
        disabled={disabled || full}
        onChange={(event) => {
          pick(event.target.files);
          // Let the same files be picked again.
          event.target.value = "";
        }}
      />

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.key}
              className={cn(
                "relative flex flex-col gap-1.5 rounded-lg border p-2",
                item.error && "border-destructive/50",
              )}
            >
              {item.url && item.previewable ? (
                <DocumentPreview
                  url={item.url}
                  title={`Photo ${index + 1}`}
                  thumbClassName="aspect-square w-full"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted">
                  <FileImage className="size-8 text-muted-foreground" aria-hidden />
                </div>
              )}
              <p className="truncate text-xs" title={item.name}>
                {item.name}
              </p>
              {item.error ? (
                <p className="text-xs text-destructive">{item.error}</p>
              ) : !item.url ? (
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`Uploading ${item.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                >
                  <div
                    className="h-full bg-primary transition-[width]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              ) : (
                <p className="text-xs text-success">Uploaded</p>
              )}
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute top-3 right-3"
                aria-label={`Remove ${item.name}`}
                disabled={disabled}
                onClick={() => remove(item.key)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={disabled || full}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus data-icon="inline-start" />
        {items.length === 0 ? "Add photos" : "Add more photos"}
      </Button>

      <FieldDescription>
        {TASK_PHOTOS_MIN} – {TASK_PHOTOS_MAX} photos. {UPLOAD_RULES.task_photo.typesLabel}, up to 5
        MB each. Each one uploads as soon as you pick it.
      </FieldDescription>
      <FieldError errors={message ? [{ message }] : []} />
    </Field>
  );
}
