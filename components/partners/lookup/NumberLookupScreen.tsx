"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Search } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ErrorState } from "@/components/common/StateMessages";
import { PageHeader } from "@/components/layout/PageHeader";
import { HolderCard } from "@/components/partners/lookup/HolderCard";
import { RemoveDraftDialog } from "@/components/partners/RemoveDraftDialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useNumberLookup } from "@/hooks/partners/useDrafts";
import { formatPhone } from "@/lib/format/phone";
import { cn } from "@/lib/utils";
import type { LookupInput, LookupType, NumberHolder } from "@/types/partner";

const TYPES: { value: LookupType; label: string; placeholder: string; hint: string }[] = [
  { value: "pan", label: "PAN", placeholder: "ABCDE1234F", hint: "10 characters, like ABCDE1234F" },
  { value: "aadhaar", label: "Aadhaar", placeholder: "2345 6789 0123", hint: "12 digits" },
  { value: "gst", label: "GST", placeholder: "27ABCDE1234F1Z5", hint: "15 characters" },
  {
    value: "bank_account",
    label: "Bank account",
    placeholder: "123456789012",
    hint: "9 to 18 digits",
  },
  { value: "upi", label: "UPI ID", placeholder: "name@bank", hint: "like name@bank" },
];

// The server's formats (backend lib/crypto/sensitiveData.ts); it checks again.
const noSpaces = (value: string) => value.replace(/[\s-]/g, "");
const PATTERNS: Record<LookupType, { clean: (v: string) => string; test: RegExp }> = {
  pan: { clean: (v) => noSpaces(v).toUpperCase(), test: /^[A-Z]{5}[0-9]{4}[A-Z]$/ },
  aadhaar: { clean: noSpaces, test: /^[2-9][0-9]{11}$/ },
  gst: {
    clean: (v) => noSpaces(v).toUpperCase(),
    test: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  },
  bank_account: { clean: noSpaces, test: /^[0-9]{9,18}$/ },
  upi: { clean: (v) => v.trim().toLowerCase(), test: /^[a-z0-9._-]{2,256}@[a-z]{2,64}$/ },
};

const schema = z
  .object({
    type: z.enum(["pan", "aadhaar", "gst", "bank_account", "upi"]),
    number: z.string(),
    ifsc: z.string(),
  })
  .superRefine((values, ctx) => {
    const rule = PATTERNS[values.type];
    const hint = TYPES.find((t) => t.value === values.type)!.hint;
    if (!rule.test.test(rule.clean(values.number))) {
      ctx.addIssue({ code: "custom", path: ["number"], message: `Not valid (${hint}).` });
    }
    if (
      values.type === "bank_account" &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(noSpaces(values.ifsc).toUpperCase())
    ) {
      ctx.addIssue({ code: "custom", path: ["ifsc"], message: "11 characters, like SBIN0001234" });
    }
  });
type FormValues = z.infer<typeof schema>;

function toInput(values: FormValues): LookupInput {
  const number = PATTERNS[values.type].clean(values.number);
  return values.type === "bank_account"
    ? { type: "bank_account", number, ifsc: noSpaces(values.ifsc).toUpperCase() }
    : { type: values.type, number };
}

/**
 * "Who holds this number?" (Admin only, DEC-096). Finds every partner holding a PAN /
 * Aadhaar / GST / bank / UPI number (old copies too). An unfinished draft can be
 * removed here; afterwards the same number is looked up again as proof (DEC-247).
 */
export function NumberLookupScreen() {
  const lookup = useNumberLookup();
  const [lastInput, setLastInput] = useState<LookupInput | null>(null);
  const [removing, setRemoving] = useState<NumberHolder | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "pan", number: "", ifsc: "" },
  });
  const type = useWatch({ control: form.control, name: "type" });
  const typeInfo = TYPES.find((t) => t.value === type)!;
  const { errors } = form.formState;

  const run = (input: LookupInput) => {
    setLastInput(input);
    lookup.mutate(input);
  };

  const result = lookup.data?.data;

  return (
    <>
      <PageHeader
        title="Number lookup"
        description="Find which partner holds a PAN, Aadhaar, GST, bank account or UPI ID — for example when a real owner is blocked by someone else's unfinished sign-up."
      />

      <form
        noValidate
        onSubmit={form.handleSubmit((values) => run(toInput(values)))}
        className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
      >
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Number type" className="flex flex-wrap gap-2">
              {TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === option.value}
                  onClick={() => {
                    field.onChange(option.value);
                    form.clearErrors();
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                    field.value === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
          <Field data-invalid={Boolean(errors.number)}>
            <FieldLabel htmlFor="lookup-number">{typeInfo.label} number</FieldLabel>
            <Input
              id="lookup-number"
              autoComplete="off"
              placeholder={typeInfo.placeholder}
              aria-invalid={Boolean(errors.number)}
              {...form.register("number")}
            />
            <FieldError errors={[errors.number]} />
          </Field>
          {type === "bank_account" ? (
            <Field data-invalid={Boolean(errors.ifsc)}>
              <FieldLabel htmlFor="lookup-ifsc">IFSC</FieldLabel>
              <Input
                id="lookup-ifsc"
                autoComplete="off"
                placeholder="SBIN0001234"
                className="uppercase"
                aria-invalid={Boolean(errors.ifsc)}
                {...form.register("ifsc")}
              />
              <FieldError errors={[errors.ifsc]} />
            </Field>
          ) : (
            <div className="hidden sm:block" />
          )}
          <Button type="submit" className="sm:mt-6" disabled={lookup.isPending}>
            {lookup.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Search data-icon="inline-start" />
            )}
            Look up
          </Button>
        </div>
      </form>

      {lookup.isError ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <ErrorState error={lookup.error} onRetry={lastInput ? () => run(lastInput) : undefined} />
        </div>
      ) : result ? (
        result.found ? (
          <section aria-label="Who holds this number" className="flex flex-col gap-3">
            <h2 className="text-base">
              {result.holders.length === 1
                ? "1 partner holds this number"
                : `${result.holders.length} partners hold this number`}
            </h2>
            <ul className="flex flex-col gap-3">
              {result.holders.map((holder) => (
                <HolderCard key={holder.partnerId} holder={holder} onRemove={setRemoving} />
              ))}
            </ul>
          </section>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-10 text-center shadow-sm">
            <CircleCheck className="size-8 text-success" aria-hidden />
            <p className="font-semibold">Nobody holds this number</p>
            <p className="text-sm text-muted-foreground">It is free to use for a new sign-up.</p>
          </div>
        )
      ) : null}

      {removing ? (
        <RemoveDraftDialog
          partnerId={removing.partnerId}
          label={removing.name ?? formatPhone(removing.phone)}
          open
          onOpenChange={(next) => !next && setRemoving(null)}
          // Look the same number up again: "Nobody holds this number" is the proof.
          onRemoved={() => lastInput && run(lastInput)}
        />
      ) : null}
    </>
  );
}
