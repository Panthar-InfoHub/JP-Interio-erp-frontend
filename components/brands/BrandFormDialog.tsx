"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBrandActions } from "@/hooks/catalog/useBrands";
import type { Brand, BrandUpdate } from "@/lib/api/catalog.api";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";

const FIELDS = ["name", "code"] as const;
type FormValues = Record<(typeof FIELDS)[number], string>;

/** Same limits as the server (backend brand.schema.ts). */
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "At most 100 characters"),
  code: z
    .string()
    .trim()
    .max(20, "At most 20 characters")
    .regex(/^[A-Za-z0-9-]*$/, "Code can only have letters, digits and hyphens"),
});

/** The server squeezes inner spaces in the name ("Green   Ply" → "Green Ply"); compare the same way. */
const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");

interface BrandFormDialogProps {
  /** null = add a new brand. */
  brand: Brand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add or edit a brand (`products.manage`, DEC-267). The code is optional and saved in
 * CAPITALS; emptying it removes it. Editing sends only what changed. A name / code clash
 * (409) shows as a red box inside the pop-up (DEC-268). The caller mounts this only while
 * open, so every opening starts from the brand's current values.
 */
export function BrandFormDialog({ brand, open, onOpenChange }: BrandFormDialogProps) {
  const isEdit = brand !== null;
  const initial: FormValues = { name: brand?.name ?? "", code: brand?.code ?? "" };
  const { create, update } = useBrandActions();
  const pending = create.isPending || update.isPending;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const { errors } = form.formState;

  const onError = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, FIELDS)) setFormError(errorMessage(error));
  };
  const onDone = (message: string | undefined, fallback: string) => {
    toast.success(message ?? fallback);
    onOpenChange(false);
  };

  const save = form.handleSubmit((values) => {
    setFormError(null);
    const name = cleanName(values.name);
    const code = values.code.trim().toUpperCase();

    if (!isEdit) {
      create.mutate(
        { name, ...(code ? { code } : {}) },
        { onSuccess: (reply) => onDone(reply.message, "Brand added"), onError },
      );
      return;
    }

    const changes: BrandUpdate = {};
    if (name !== initial.name) changes.name = name;
    if (code !== initial.code) changes.code = code || null;
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { id: brand.id, changes },
      { onSuccess: (reply) => onDone(reply.message, "Brand updated"), onError },
    );
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit ${brand.name}` : "Add a brand"}
      description={
        isEdit
          ? "Switching the brand off or on is a separate action."
          : "Products can be added to the brand once it exists."
      }
      submitLabel={isEdit ? "Save changes" : "Add brand"}
      pending={pending}
      onSubmit={save}
      formError={formError}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="brand-name">Name</FieldLabel>
          <Input
            id="brand-name"
            aria-invalid={Boolean(errors.name)}
            autoComplete="off"
            placeholder="e.g. Greenply"
            {...form.register("name")}
          />
          <FieldDescription>
            Must be unique (capitals and extra spaces don&apos;t count).
          </FieldDescription>
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.code)}>
          <FieldLabel htmlFor="brand-code">Code (optional)</FieldLabel>
          <Input
            id="brand-code"
            aria-invalid={Boolean(errors.code)}
            autoComplete="off"
            placeholder="e.g. GP"
            className="uppercase"
            {...form.register("code")}
          />
          <FieldDescription>
            Letters, digits and hyphens, up to 20. Saved in capitals.
            {isEdit && brand.code ? " Empty it to remove the code." : ""}
          </FieldDescription>
          <FieldError errors={[errors.code]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
