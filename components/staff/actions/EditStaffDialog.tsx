"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useStaffActions } from "@/hooks/staff/useStaffActions";
import { toTenDigitMobile } from "@/lib/format/phone";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import type { StaffChanges, StaffDetail } from "@/types/staff";

const FIELDS = ["name", "phone", "email"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "At most 100 characters"),
  phone: z
    .string()
    .refine((value) => toTenDigitMobile(value) !== null, "Enter a valid 10-digit mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address").max(255)]),
});
type FormValues = z.infer<typeof schema>;

interface EditStaffDialogProps {
  member: StaffDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit name, mobile and email (`PATCH /users/:id`). Sends only what changed; an emptied
 * email is cleared. A new mobile logs the person out everywhere. Role, manager, zone and
 * status are separate actions. Mounted only while open, so it starts from current values.
 */
export function EditStaffDialog({ member, open, onOpenChange }: EditStaffDialogProps) {
  const initial: FormValues = {
    name: member.name ?? "",
    phone: toTenDigitMobile(member.phone) ?? member.phone,
    email: member.email ?? "",
  };
  const { update } = useStaffActions(member.id);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const { errors } = form.formState;
  const phone = useWatch({ control: form.control, name: "phone" });
  const phoneChanged = (toTenDigitMobile(phone) ?? phone) !== initial.phone;

  const save = form.handleSubmit((values) => {
    const changes: StaffChanges = {};
    const name = values.name.trim();
    const newPhone = toTenDigitMobile(values.phone) ?? values.phone;
    const email = values.email.trim();
    if (name !== initial.name) changes.name = name;
    if (newPhone !== initial.phone) changes.phone = newPhone;
    if (email !== initial.email) changes.email = email || null;
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(changes, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? "Details updated");
        onOpenChange(false);
      },
      onError: (error) => {
        if (!applyServerFieldErrors(error, form.setError, FIELDS)) toast.error(errorMessage(error));
      },
    });
  });

  const field = (
    name: (typeof FIELDS)[number],
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`edit-staff-${name}`}>{label}</FieldLabel>
      <Input
        id={`edit-staff-${name}`}
        aria-invalid={Boolean(errors[name])}
        autoComplete="off"
        {...props}
        {...form.register(name)}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${member.name ?? "staff member"}`}
      description="Role, manager, zone and status can't be changed here."
      submitLabel="Save changes"
      pending={update.isPending}
      onSubmit={save}
    >
      <FieldGroup>
        {field("name", "Name")}
        {field("phone", "Mobile number", { inputMode: "tel" })}
        {phoneChanged ? (
          <Alert>
            <AlertDescription>
              A new mobile number logs them out on every device. They log in again with the new
              number.
            </AlertDescription>
          </Alert>
        ) : null}
        {field("email", "Email (optional)", { type: "email" })}
      </FieldGroup>
    </FormDialog>
  );
}
