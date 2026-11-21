"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePartnerActions } from "@/hooks/partners/usePartnerActions";
import { todayInIndia } from "@/lib/format/istDay";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import type { Partner360, PartnerProfileChanges } from "@/types/partner";

const FIELDS = [
  "name",
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "businessName",
  "ownerDob",
  "ownerAnniversaryDate",
  "ownerSpouseName",
] as const;
type FieldName = (typeof FIELDS)[number];
type FormValues = Record<FieldName, string>;

/** Same limits as the server (backend partnerProfile.schema.ts). */
function schemaFor(needsFirmName: boolean) {
  const required = (label: string, max: number) =>
    z.string().trim().min(1, `${label} is required`).max(max, `At most ${max} characters`);
  const optional = (max: number) => z.string().trim().max(max, `At most ${max} characters`);
  const pastDay = z
    .string()
    .refine((value) => value === "" || value <= todayInIndia(), "Cannot be in the future");
  return z.object({
    name: required("Name", 100),
    email: z.union([z.literal(""), z.email("Enter a valid email address").max(255)]),
    address: required("Address", 500),
    city: required("City", 100),
    state: required("State", 100),
    pincode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits"),
    businessName: needsFirmName ? required("Firm name", 150) : optional(150),
    ownerDob: pastDay,
    ownerAnniversaryDate: pastDay,
    ownerSpouseName: optional(100),
  });
}

function startValues(partner: Partner360): FormValues {
  const info = partner.basicInfo;
  const firm = partner.firmDetails;
  return {
    name: info?.name ?? "",
    email: info?.email ?? "",
    address: info?.address ?? "",
    city: info?.city ?? "",
    state: info?.state ?? "",
    pincode: info?.pincode ?? "",
    businessName: info?.businessName ?? "",
    ownerDob: firm?.ownerDob ?? "",
    ownerAnniversaryDate: firm?.ownerAnniversaryDate ?? "",
    ownerSpouseName: firm?.ownerSpouseName ?? "",
  };
}

interface EditPartnerDialogProps {
  partner: Partner360;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit a verified partner's details (DEC-103). Sends only what changed. Never here:
 * mobile (own action), zone (move ASM), type, GST / PAN / Aadhaar.
 */
export function EditPartnerDialog({ partner, open, onOpenChange }: EditPartnerDialogProps) {
  const isFirm =
    partner.basicInfo?.partnerType === "dealer" || partner.basicInfo?.partnerType === "oem";
  const initial = startValues(partner);
  const { editProfile } = usePartnerActions(partner.partnerId);
  // The menu mounts this dialog only while it is open, so every opening starts from the
  // partner's current details.
  const form = useForm<FormValues>({
    resolver: zodResolver(schemaFor(isFirm)),
    defaultValues: initial,
  });
  const { errors } = form.formState;

  const save = form.handleSubmit((values) => {
    const changes: PartnerProfileChanges = {};
    for (const field of FIELDS) {
      if (!isFirm && field.startsWith("owner")) continue;
      const next = values[field].trim();
      if (next !== initial[field].trim()) changes[field] = next;
    }
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    editProfile.mutate(changes, {
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
    name: FieldName,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`edit-${name}`}>{label}</FieldLabel>
      <Input
        id={`edit-${name}`}
        aria-invalid={Boolean(errors[name])}
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
      title="Edit partner details"
      description="Mobile number, zone, partner type, PAN, Aadhaar and GST can't be changed here."
      submitLabel="Save changes"
      pending={editProfile.isPending}
      onSubmit={save}
      size="md"
    >
      <FieldGroup>
        {field("name", "Name", { autoComplete: "off" })}
        {field("businessName", isFirm ? "Firm name" : "Business name (optional)")}
        {field("email", "Email (optional)", { type: "email" })}
        <Field data-invalid={Boolean(errors.address)}>
          <FieldLabel htmlFor="edit-address">Address</FieldLabel>
          <Textarea
            id="edit-address"
            rows={2}
            aria-invalid={Boolean(errors.address)}
            {...form.register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("city", "City")}
          {field("state", "State")}
        </div>
        {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6 })}
        {isFirm ? (
          <>
            <p className="pt-2 text-sm font-semibold">Owner / director (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("ownerDob", "Date of birth", { type: "date", max: todayInIndia() })}
              {field("ownerAnniversaryDate", "Anniversary", { type: "date", max: todayInIndia() })}
            </div>
            {field("ownerSpouseName", "Spouse's name")}
          </>
        ) : null}
      </FieldGroup>
    </FormDialog>
  );
}
