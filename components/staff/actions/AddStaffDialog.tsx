"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAsmOptions } from "@/hooks/data/useAsmOptions";
import { useZoneOptions } from "@/hooks/data/useZoneOptions";
import { useCreateStaff } from "@/hooks/staff/useStaffActions";
import { areaLabel, SUB_ADMIN_AREAS } from "@/lib/auth/roles";
import { toTenDigitMobile } from "@/lib/format/phone";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { STAFF_ROLE_LABELS } from "@/lib/labels/staff";
import { useAuthStore } from "@/stores/auth.store";
import type { SubAdminArea } from "@/types/auth";
import type { NewStaffRole, StaffCreateInput } from "@/types/staff";

const NO_ZONE = "none";

/**
 * Same rules as the server (backend user.schema.ts); the role decides the extra field.
 * `zoneId`: Zonal Head a zone id or NO_ZONE; ASM / SE (Admin) a zone id.
 */
const schema = z
  .object({
    role: z.string(),
    name: z.string().trim().min(1, "Name is required").max(100, "At most 100 characters"),
    phone: z
      .string()
      .refine((value) => toTenDigitMobile(value) !== null, "Enter a valid 10-digit mobile number"),
    email: z.union([z.literal(""), z.email("Enter a valid email address").max(255)]),
    areas: z.array(z.enum(SUB_ADMIN_AREAS as [SubAdminArea, ...SubAdminArea[]])),
    zoneId: z.string(),
    asmId: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.role) ctx.addIssue({ code: "custom", path: ["role"], message: "Pick a role" });
    if (values.role === "zonal_head" && !values.zoneId) {
      ctx.addIssue({ code: "custom", path: ["zoneId"], message: "Pick a zone or “No zone yet”" });
    }
    if (values.role === "asm" && !values.zoneId) {
      ctx.addIssue({ code: "custom", path: ["zoneId"], message: "Pick the zone" });
    }
    if (values.role === "sales_executive" && !values.asmId) {
      ctx.addIssue({ code: "custom", path: ["asmId"], message: "Pick the ASM" });
    }
  });

type FormValues = z.infer<typeof schema>;

const SERVER_FIELDS = ["role", "name", "phone", "email", "areas", "zoneId", "asmId"] as const;

interface AddStaffDialogProps {
  roles: NewStaffRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add a staff member (F6 T3). The role list follows what this person may add (Admin: all
 * four; Zonal Head: ASM and Sales Executive in their zone). The server fills in the
 * manager and zone and refuses what the rules don't allow (zone with no Zonal Head, a
 * taken phone …); its message is shown. Opens the new person's page when done.
 */
export function AddStaffDialog({ roles, open, onOpenChange }: AddStaffDialogProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const ownZone = user?.role.key === "zonal_head" ? user.zone : null;
  const create = useCreateStaff();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: roles.length === 1 ? roles[0] : "",
      name: "",
      phone: "",
      email: "",
      areas: [],
      zoneId: ownZone?.id ?? "",
      asmId: "",
    },
  });
  const { errors } = form.formState;
  const role = useWatch({ control: form.control, name: "role" });
  const zoneId = useWatch({ control: form.control, name: "zoneId" });

  const zones = useZoneOptions(open && !ownZone);
  // Sales Executive: the Admin picks the zone first; a Zonal Head sees their zone's ASMs.
  const asmZone = ownZone ? null : zoneId || null;
  const asms = useAsmOptions(
    asmZone,
    open && role === "sales_executive" && Boolean(ownZone || zoneId),
  );

  const zoneOptions = (filter: "free" | "headed" | "all") =>
    Object.fromEntries(
      (zones.data ?? [])
        .filter((zone) =>
          filter === "free"
            ? !zone.zonalHead
            : filter === "headed"
              ? Boolean(zone.zonalHead)
              : true,
        )
        .map((zone) => [zone.id, zone.name]),
    );
  const asmOptions = Object.fromEntries(
    (asms.data ?? []).map((asm) => [asm.id, asm.name ?? "Unnamed ASM"]),
  );

  const save = form.handleSubmit((values) => {
    const input: StaffCreateInput = {
      role: values.role as NewStaffRole,
      name: values.name.trim(),
      phone: toTenDigitMobile(values.phone) ?? values.phone,
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
    };
    if (input.role === "sub_admin") input.areas = values.areas;
    if (input.role === "zonal_head")
      input.zoneId = values.zoneId === NO_ZONE ? null : values.zoneId;
    if (input.role === "asm") input.zoneId = values.zoneId;
    if (input.role === "sales_executive") input.asmId = values.asmId;

    create.mutate(input, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? "Staff added");
        onOpenChange(false);
        router.push(`/staff/${reply.data.id}`);
      },
      onError: (error) => {
        if (!applyServerFieldErrors(error, form.setError, SERVER_FIELDS)) {
          toast.error(errorMessage(error));
        }
      },
    });
  });

  const text = (
    name: "name" | "phone" | "email",
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`add-${name}`}>{label}</FieldLabel>
      <Input
        id={`add-${name}`}
        aria-invalid={Boolean(errors[name])}
        autoComplete="off"
        {...props}
        {...form.register(name)}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  const zoneSelect = (options: Record<string, string>, placeholder: string, hint?: string) => (
    <Field data-invalid={Boolean(errors.zoneId)}>
      <FieldLabel>Zone</FieldLabel>
      <Controller
        control={form.control}
        name="zoneId"
        render={({ field }) => (
          <FilterSelect
            label="Zone"
            value={field.value || null}
            onChange={(next) => {
              field.onChange(next ?? "");
              form.setValue("asmId", "");
            }}
            options={options}
            allLabel={zones.isPending ? "Loading zones…" : placeholder}
            className="w-full"
          />
        )}
      />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldError errors={[errors.zoneId]} />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add staff"
      description="They can log in straight away with their mobile number and OTP."
      submitLabel="Add staff"
      pending={create.isPending}
      onSubmit={save}
      size="md"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.role)}>
          <FieldLabel>Role</FieldLabel>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <FilterSelect
                label="Role"
                value={field.value || null}
                onChange={(next) => {
                  field.onChange(next ?? "");
                  form.setValue("zoneId", ownZone?.id ?? "");
                  form.setValue("asmId", "");
                  form.clearErrors(["zoneId", "asmId"]);
                }}
                options={Object.fromEntries(roles.map((item) => [item, STAFF_ROLE_LABELS[item]]))}
                allLabel="Pick a role"
                className="w-full"
              />
            )}
          />
          <FieldError errors={[errors.role]} />
        </Field>

        {text("name", "Name")}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("phone", "Mobile number", { inputMode: "tel", placeholder: "98765 43210" })}
          {text("email", "Email (optional)", { type: "email" })}
        </div>

        {role === "sub_admin" ? (
          <FieldSet>
            <FieldLegend variant="label">Areas (optional)</FieldLegend>
            <FieldDescription>
              What this Sub-Admin may work on. Can be changed later.
            </FieldDescription>
            <Controller
              control={form.control}
              name="areas"
              render={({ field }) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  {SUB_ADMIN_AREAS.map((area) => (
                    <Field key={area} orientation="horizontal">
                      <Checkbox
                        id={`area-${area}`}
                        checked={field.value.includes(area)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, area]
                              : field.value.filter((item) => item !== area),
                          )
                        }
                      />
                      <FieldLabel htmlFor={`area-${area}`} className="font-normal">
                        {areaLabel(area)}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              )}
            />
          </FieldSet>
        ) : null}

        {role === "zonal_head"
          ? zoneSelect(
              { [NO_ZONE]: "No zone yet", ...zoneOptions("free") },
              "Pick a zone",
              "Only zones with no Zonal Head are listed. “No zone yet” lets you put them in charge later from Zones.",
            )
          : null}

        {role === "asm" ? (
          ownZone ? (
            <p className="text-sm text-muted-foreground">
              The ASM joins your zone, {ownZone.name}, and reports to you.
            </p>
          ) : (
            zoneSelect(
              zoneOptions("headed"),
              "Pick a zone",
              "Only zones with a Zonal Head are listed. The ASM reports to that Zonal Head.",
            )
          )
        ) : null}

        {role === "sales_executive" ? (
          <>
            {!ownZone ? zoneSelect(zoneOptions("all"), "Pick a zone") : null}
            <Field data-invalid={Boolean(errors.asmId)}>
              <FieldLabel>ASM</FieldLabel>
              <Controller
                control={form.control}
                name="asmId"
                render={({ field }) => (
                  <FilterSelect
                    label="ASM"
                    value={field.value || null}
                    onChange={(next) => field.onChange(next ?? "")}
                    options={asmOptions}
                    allLabel={
                      !ownZone && !zoneId
                        ? "Pick a zone first"
                        : asms.isPending
                          ? "Loading ASMs…"
                          : Object.keys(asmOptions).length === 0
                            ? "No active ASM here"
                            : "Pick an ASM"
                    }
                    disabled={(!ownZone && !zoneId) || Object.keys(asmOptions).length === 0}
                    className="w-full"
                  />
                )}
              />
              <FieldDescription>
                The Sales Executive works under this ASM, in the ASM&apos;s zone.
              </FieldDescription>
              <FieldError errors={[errors.asmId]} />
            </Field>
          </>
        ) : null}
      </FieldGroup>
    </FormDialog>
  );
}
