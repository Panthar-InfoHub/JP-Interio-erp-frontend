"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCategoryActions } from "@/hooks/catalog/useCategories";
import type { CategoryTreeNode } from "@/lib/api/catalog.api";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";

const FIELDS = ["name"] as const;
type FormValues = { name: string };

/** Same limits as the server (backend category.schema.ts). */
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "At most 100 characters"),
});

/** The server squeezes inner spaces ("Marine   Ply" → "Marine Ply"); compare the same way. */
const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");

export type CategoryNameMode =
  /** A new category; `parent` null = top level. */
  | { kind: "add"; parent: { id: string; name: string } | null }
  | { kind: "rename"; category: CategoryTreeNode };

interface CategoryNameDialogProps {
  mode: CategoryNameMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add a category (top level or under a parent) or rename one (DEC-267). Names are unique
 * among siblings (capitals ignored): a clash shows in the red box (DEC-268). Mounted only
 * while open, so every opening starts fresh.
 */
export function CategoryNameDialog({ mode, open, onOpenChange }: CategoryNameDialogProps) {
  const isRename = mode.kind === "rename";
  const initialName = isRename ? mode.category.name : "";
  const { create, update } = useCategoryActions();
  const pending = create.isPending || update.isPending;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName },
  });
  const { errors } = form.formState;

  const onError = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, FIELDS)) setFormError(errorMessage(error));
  };
  const onDone = (message: string | undefined, fallback: string) => {
    toast.success(message ?? fallback);
    onOpenChange(false);
  };

  const save = form.handleSubmit(({ name: raw }) => {
    setFormError(null);
    const name = cleanName(raw);

    if (mode.kind === "add") {
      create.mutate(
        { name, parentId: mode.parent?.id ?? null },
        { onSuccess: (reply) => onDone(reply.message, "Category added"), onError },
      );
      return;
    }
    if (name === initialName) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { id: mode.category.id, changes: { name } },
      { onSuccess: (reply) => onDone(reply.message, "Category renamed"), onError },
    );
  });

  const title =
    mode.kind === "rename"
      ? `Rename ${mode.category.name}`
      : mode.parent
        ? `Add a sub-category under ${mode.parent.name}`
        : "Add a top-level category";

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        isRename
          ? "Its sub-categories and products stay where they are."
          : "Products can be placed on any category, at any level."
      }
      submitLabel={isRename ? "Save name" : "Add category"}
      pending={pending}
      onSubmit={save}
      formError={formError}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="category-name">Name</FieldLabel>
          <Input
            id="category-name"
            aria-invalid={Boolean(errors.name)}
            autoComplete="off"
            placeholder="e.g. Marine"
            {...form.register("name")}
          />
          <FieldDescription>
            Must be unique among the categories at the same level (capitals don&apos;t count).
          </FieldDescription>
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
