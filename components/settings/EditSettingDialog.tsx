"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSettingActions } from "@/hooks/settings/useSettings";
import type { Setting } from "@/lib/api/settings.api";
import { isApiError } from "@/lib/api/errors";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { withUnit } from "@/lib/settings/settingGroups";

interface EditSettingDialogProps {
  setting: Setting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Change one whole-number setting (Admin, DEC-301). The limits come from the server's
 * `min` / `max`; the pop-up shows old → new and says the change applies straight away for
 * everyone (pressing Save is the confirmation). Same value → "No change". The caller mounts
 * this only while open, so every opening starts from the current value.
 */
export function EditSettingDialog({ setting, open, onOpenChange }: EditSettingDialogProps) {
  const { update } = useSettingActions();
  const [formError, setFormError] = useState<string | null>(null);
  const current = typeof setting.value === "number" ? setting.value : null;

  const schema = useMemo(() => {
    let value = z.number({ message: "Enter a whole number" }).int("Enter a whole number");
    if (setting.min !== null) value = value.min(setting.min, `At least ${setting.min}`);
    if (setting.max !== null) {
      value = value.max(setting.max, `At most ${setting.max.toLocaleString("en-IN")}`);
    }
    return z.object({ value });
  }, [setting.min, setting.max]);

  const form = useForm<{ value: number }>({
    resolver: zodResolver(schema),
    defaultValues: { value: current ?? undefined },
  });
  const typed = useWatch({ control: form.control, name: "value" });
  const error = form.formState.errors.value;

  const save = form.handleSubmit(({ value }) => {
    setFormError(null);
    if (value === current) {
      toast.info("No change");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { key: setting.key, value },
      {
        onSuccess: (reply) => {
          if (reply.data.changed) toast.success(reply.message ?? "Setting updated");
          else toast.info(reply.message ?? "No change");
          onOpenChange(false);
        },
        onError: (failure) => {
          if (applyServerFieldErrors(failure, form.setError, ["value"])) return;
          // e.g. SETTING_READ_ONLY, or a setting removed meanwhile (404).
          setFormError(
            isApiError(failure) && failure.status === 404
              ? "This setting no longer exists. Refresh the page."
              : errorMessage(failure),
          );
        },
      },
    );
  });

  const range =
    setting.min !== null && setting.max !== null
      ? `Allowed: ${withUnit(setting.key, setting.min)} to ${withUnit(setting.key, setting.max)}.`
      : null;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change setting"
      description={`${setting.description} The change applies straight away for everyone.`}
      submitLabel="Save"
      pending={update.isPending}
      onSubmit={save}
      formError={formError}
    >
      <div className="grid gap-4">
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="setting-value">New value</FieldLabel>
          <Input
            id="setting-value"
            type="number"
            inputMode="numeric"
            step={1}
            min={setting.min ?? undefined}
            max={setting.max ?? undefined}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            {...form.register("value", { valueAsNumber: true })}
          />
          {range ? <FieldDescription>{range}</FieldDescription> : null}
          <FieldError errors={[error]} />
        </Field>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          <span className="text-muted-foreground">Now</span>
          <span className="font-semibold">{withUnit(setting.key, current)}</span>
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">New</span>
          <span className="font-semibold">
            {typeof typed === "number" && !Number.isNaN(typed) ? withUnit(setting.key, typed) : "—"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Key <code>{setting.key}</code> · default {withUnit(setting.key, setting.default)}
        </p>
      </div>
    </FormDialog>
  );
}
