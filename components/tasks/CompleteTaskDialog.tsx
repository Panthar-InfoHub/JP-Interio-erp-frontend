"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import {
  TASK_PHOTOS_MAX,
  TASK_PHOTOS_MIN,
  TaskPhotosField,
} from "@/components/tasks/TaskPhotosField";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useTaskActions } from "@/hooks/tasks/useTasks";
import type { TaskRow } from "@/lib/api/tasks.api";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";

/** Same limit as the server (DEC-177). */
const NOTE_MAX = 2000;

const schema = z.object({
  photoUrls: z
    .array(z.string())
    .min(TASK_PHOTOS_MIN, "Add at least one photo")
    .max(TASK_PHOTOS_MAX, `At most ${TASK_PHOTOS_MAX} photos`),
  note: z.string().trim().max(NOTE_MAX, `At most ${NOTE_MAX} characters`),
});

type FormValues = z.infer<typeof schema>;

interface CompleteTaskDialogProps {
  task: Pick<TaskRow, "id" | "title" | "isOverdue">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Complete my task (only the doer, DEC-181, DEC-293): 1 – 10 photos (each uploads at once)
 * and an optional note. "Complete task" waits until every photo is uploaded. After this the
 * task is locked. Refusals that belong to no field (e.g. it was just cancelled, a photo the
 * server couldn't find) show in the red box (DEC-268). The caller mounts this only while
 * open, so every opening starts fresh.
 */
export function CompleteTaskDialog({ task, open, onOpenChange }: CompleteTaskDialogProps) {
  const { complete } = useTaskActions();
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { photoUrls: [], note: "" },
  });
  const { errors } = form.formState;

  const setPhotos = useCallback(
    (urls: string[]) =>
      form.setValue("photoUrls", urls, { shouldValidate: form.formState.isSubmitted }),
    [form],
  );

  const save = form.handleSubmit((values) => {
    setFormError(null);
    complete.mutate(
      {
        id: task.id,
        input: { photoUrls: values.photoUrls, ...(values.note ? { note: values.note } : {}) },
      },
      {
        onSuccess: (reply) => {
          toast.success(reply.message ?? "Task completed");
          onOpenChange(false);
        },
        onError: (error) => {
          if (!applyServerFieldErrors(error, form.setError, ["photoUrls", "note"])) {
            setFormError(errorMessage(error));
          }
        },
      },
    );
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Complete "${task.title}"`}
      description={
        <>
          After this the task is locked: it can&apos;t be edited, cancelled or changed.
          {task.isOverdue ? " It's past the due day; completing late is fine." : null}
        </>
      }
      submitLabel={uploading ? "Uploading photos…" : "Complete task"}
      pending={complete.isPending}
      submitDisabled={uploading}
      onSubmit={save}
      formError={formError}
      size="md"
    >
      <FieldGroup>
        <TaskPhotosField
          onChange={setPhotos}
          onBusyChange={setUploading}
          error={errors.photoUrls?.message}
          disabled={complete.isPending}
        />
        <Field data-invalid={Boolean(errors.note)}>
          <FieldLabel htmlFor="task-note">Note (optional)</FieldLabel>
          <Textarea
            id="task-note"
            aria-invalid={Boolean(errors.note)}
            rows={3}
            maxLength={NOTE_MAX}
            placeholder="e.g. Display set up; the owner is happy"
            {...form.register("note")}
          />
          <FieldDescription>Up to {NOTE_MAX.toLocaleString("en-IN")} characters.</FieldDescription>
          <FieldError errors={[errors.note]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
