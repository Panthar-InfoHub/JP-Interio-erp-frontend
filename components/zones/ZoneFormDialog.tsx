"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useZoneActions } from "@/hooks/zones/useZones";
import type { Zone, ZoneUpdate } from "@/lib/api/zones.api";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";

const FIELDS = ["name", "code", "region", "state"] as const;
type FieldName = (typeof FIELDS)[number];
type FormValues = Record<FieldName, string>;

/** Same limits as the server (backend zone.schema.ts). */
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "At most 100 characters"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "At most 20 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Code can only have letters, digits and hyphens"),
  region: z.string().trim().max(100, "At most 100 characters"),
  state: z.string().trim().max(100, "At most 100 characters"),
});

function startValues(zone: Zone | null): FormValues {
  return {
    name: zone?.name ?? "",
    code: zone?.code ?? "",
    region: zone?.region ?? "",
    state: zone?.state ?? "",
  };
}

/** Anyone counted in the zone means the code is locked for sure (the server checks too). */
function hasPeople(zone: Zone | null): boolean {
  const counts = zone?.counts;
  if (!counts) return false;
  return (counts.asms ?? 0) + (counts.salesExecutives ?? 0) + (counts.partners ?? 0) > 0;
}

interface ZoneFormDialogProps {
  /** null = add a new zone. */
  zone: Zone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add or edit a zone (Admin, DEC-261). Code is saved in CAPITALS; code and name are unique.
 * Editing sends only what changed; an emptied region / state is cleared. The caller mounts
 * this only while open, so every opening starts from the zone's current values.
 */
export function ZoneFormDialog({ zone, open, onOpenChange }: ZoneFormDialogProps) {
  const isEdit = zone !== null;
  const codeLocked = hasPeople(zone);
  const initial = startValues(zone);
  const { create, update } = useZoneActions();
  const pending = create.isPending || update.isPending;
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const { errors } = form.formState;

  const onError = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, FIELDS)) toast.error(errorMessage(error));
  };
  const onDone = (message: string | undefined, fallback: string) => {
    toast.success(message ?? fallback);
    onOpenChange(false);
  };

  const save = form.handleSubmit((values) => {
    const trimmed = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      region: values.region.trim(),
      state: values.state.trim(),
    };

    if (!isEdit) {
      create.mutate(
        {
          name: trimmed.name,
          code: trimmed.code,
          ...(trimmed.region ? { region: trimmed.region } : {}),
          ...(trimmed.state ? { state: trimmed.state } : {}),
        },
        { onSuccess: (reply) => onDone(reply.message, "Zone added"), onError },
      );
      return;
    }

    const changes: ZoneUpdate = {};
    if (trimmed.name !== initial.name) changes.name = trimmed.name;
    if (trimmed.code !== initial.code) changes.code = trimmed.code;
    if (trimmed.region !== initial.region) changes.region = trimmed.region || null;
    if (trimmed.state !== initial.state) changes.state = trimmed.state || null;
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { id: zone.id, changes },
      { onSuccess: (reply) => onDone(reply.message, "Zone updated"), onError },
    );
  });

  const field = (
    name: FieldName,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
    hint?: string,
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`zone-${name}`}>{label}</FieldLabel>
      <Input
        id={`zone-${name}`}
        aria-invalid={Boolean(errors[name])}
        autoComplete="off"
        {...props}
        {...form.register(name)}
      />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit ${zone.name}` : "Add a zone"}
      description={
        isEdit
          ? "Switching the zone off or on and its Zonal Head are separate actions."
          : "Add the Zonal Head after the zone is created."
      }
      submitLabel={isEdit ? "Save changes" : "Add zone"}
      pending={pending}
      onSubmit={save}
    >
      <FieldGroup>
        {field("name", "Name", { placeholder: "e.g. North Zone" })}
        {field(
          "code",
          "Code",
          // readOnly, not disabled: a disabled field would drop out of the form values.
          {
            placeholder: "e.g. NZ-01",
            className: codeLocked ? "uppercase opacity-60" : "uppercase",
            readOnly: codeLocked,
          },
          codeLocked
            ? "Can't be changed: people have been added to this zone."
            : "Letters, digits and hyphens, up to 20. Saved in capitals. Locked once people are added.",
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("region", "Region (optional)")}
          {field("state", "State (optional)")}
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
