"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePartnerActions } from "@/hooks/partners/usePartnerActions";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { cn } from "@/lib/utils";
import type { PayoutAccount, PayoutAccountChanges, PayoutAccountInput } from "@/types/partner";

const FIELDS = ["method", "holderName", "accountNumber", "ifsc", "bankName", "upiId"] as const;
type FormValues = {
  method: "bank" | "upi";
  holderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  upiId: string;
};

// The server's formats (backend lib/crypto/sensitiveData.ts); checked again there.
const noSpaces = (value: string) => value.replace(/[\s-]/g, "");
const schema = z
  .object({
    method: z.enum(["bank", "upi"]),
    holderName: z.string().trim().max(150, "At most 150 characters"),
    accountNumber: z.string(),
    ifsc: z.string(),
    bankName: z.string().trim().max(150, "At most 150 characters"),
    upiId: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.method === "bank") {
      if (!values.holderName) {
        ctx.addIssue({
          code: "custom",
          path: ["holderName"],
          message: "Account holder's name is required",
        });
      }
      if (!/^[0-9]{9,18}$/.test(noSpaces(values.accountNumber))) {
        ctx.addIssue({ code: "custom", path: ["accountNumber"], message: "9 to 18 digits" });
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(noSpaces(values.ifsc).toUpperCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["ifsc"],
          message: "11 characters, like SBIN0001234",
        });
      }
    } else if (!/^[a-z0-9._-]{2,256}@[a-z]{2,64}$/.test(values.upiId.trim().toLowerCase())) {
      ctx.addIssue({ code: "custom", path: ["upiId"], message: "Like name@bank" });
    }
  });

interface PayoutAccountDialogProps {
  partnerId: string;
  /** null = add a new account; an account = edit it. */
  account: PayoutAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add or edit a bank account / UPI ID (DEC-101, DEC-102). No approval: usable at once.
 * Editing sends only what changed; bank ↔ UPI is not an edit (remove and add).
 */
export function PayoutAccountDialog({
  partnerId,
  account,
  open,
  onOpenChange,
}: PayoutAccountDialogProps) {
  const { addAccount, editAccount } = usePartnerActions(partnerId);
  const editing = account !== null;
  const initial: FormValues = {
    method: account?.method ?? "bank",
    holderName: account?.holderName ?? "",
    accountNumber: account?.accountNumber ?? "",
    ifsc: account?.ifsc ?? "",
    bankName: account?.bankName ?? "",
    upiId: account?.upiId ?? "",
  };
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const method = useWatch({ control: form.control, name: "method" });
  const { errors } = form.formState;
  const pending = addAccount.isPending || editAccount.isPending;

  const onError = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, FIELDS)) toast.error(errorMessage(error));
  };
  const onDone = (message?: string) => {
    toast.success(message ?? (editing ? "Account updated" : "Account added"));
    onOpenChange(false);
  };

  const save = form.handleSubmit((values) => {
    const clean = {
      holderName: values.holderName.trim(),
      accountNumber: noSpaces(values.accountNumber),
      ifsc: noSpaces(values.ifsc).toUpperCase(),
      bankName: values.bankName.trim(),
      upiId: values.upiId.trim().toLowerCase(),
    };

    if (!editing) {
      const input: PayoutAccountInput =
        values.method === "bank"
          ? {
              method: "bank",
              holderName: clean.holderName,
              accountNumber: clean.accountNumber,
              ifsc: clean.ifsc,
              bankName: clean.bankName || null,
            }
          : { method: "upi", upiId: clean.upiId, holderName: clean.holderName || null };
      addAccount.mutate(input, { onSuccess: (reply) => onDone(reply.message), onError });
      return;
    }

    const changes: PayoutAccountChanges = {};
    if (clean.holderName !== (account.holderName ?? ""))
      changes.holderName = clean.holderName || null;
    if (account.method === "bank") {
      if (clean.accountNumber !== account.accountNumber)
        changes.accountNumber = clean.accountNumber;
      if (clean.ifsc !== (account.ifsc ?? "")) changes.ifsc = clean.ifsc;
      if (clean.bankName !== (account.bankName ?? "")) changes.bankName = clean.bankName || null;
    } else if (clean.upiId !== account.upiId) {
      changes.upiId = clean.upiId;
    }
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    editAccount.mutate(
      { accountId: account.id, changes },
      { onSuccess: (reply) => onDone(reply.message), onError },
    );
  });

  const text = (
    name: Exclude<keyof FormValues, "method">,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`account-${name}`}>{label}</FieldLabel>
      <Input
        id={`account-${name}`}
        autoComplete="off"
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
      title={
        editing
          ? account.method === "bank"
            ? "Edit bank account"
            : "Edit UPI ID"
          : "Add bank account or UPI ID"
      }
      description={
        editing
          ? "Changing the number frees the old one. To switch between bank and UPI, remove this account and add a new one."
          : "Usable straight away, no approval. It becomes the default only if the partner has no other account."
      }
      submitLabel={editing ? "Save changes" : "Add account"}
      pending={pending}
      onSubmit={save}
      size="md"
    >
      <FieldGroup>
        {!editing ? (
          <Controller
            control={form.control}
            name="method"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-2">
                {(["bank", "upi"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={field.value === option}
                    onClick={() => field.onChange(option)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                      field.value === option
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option === "bank" ? "Bank account" : "UPI ID"}
                  </button>
                ))}
              </div>
            )}
          />
        ) : null}

        {method === "bank" ? (
          <>
            {text("holderName", "Account holder's name")}
            {text("accountNumber", "Account number", { inputMode: "numeric" })}
            <div className="grid gap-4 sm:grid-cols-2">
              {text("ifsc", "IFSC", { className: "uppercase" })}
              {text("bankName", "Bank name (optional)")}
            </div>
          </>
        ) : (
          <>
            {text("upiId", "UPI ID", { inputMode: "email", placeholder: "name@bank" })}
            {text("holderName", "Name (optional)")}
            <FieldDescription>
              Check the UPI ID with the partner; payouts go straight to it.
            </FieldDescription>
          </>
        )}
      </FieldGroup>
    </FormDialog>
  );
}
