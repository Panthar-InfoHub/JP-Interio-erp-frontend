"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { QrProductSearchList } from "@/components/qr-batches/QrProductSearchList";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQrBatch } from "@/hooks/qr/useQrBatches";
import type { QrPickerProduct } from "@/lib/api/qr.api";
import { PATH_SEPARATOR } from "@/lib/catalog/categoryTree";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";
import { formatCount, formatPoints, formatRupees } from "@/lib/format/number";

const FIELDS = ["productId", "quantity", "pointsPerCode", "notes"] as const;

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, "A whole number, e.g. 3000")
    .refine((value) => Number(value) >= 1, "At least 1");

/**
 * Only the basic checks; the upper limits are Admin settings the panel can't read, so the
 * server's own message shows under the field (DEC-275).
 */
const schema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantity: wholeNumber("Number of codes"),
  pointsPerCode: wholeNumber("Points per code"),
  notes: z.string().trim().max(500, "At most 500 characters"),
});

type FormValues = z.infer<typeof schema>;

const START: FormValues = { productId: "", quantity: "", pointsPerCode: "", notes: "" };

/** quantity × points, or null while either is not a whole number ≥ 1. */
function totalOf(quantity: string, points: string): number | null {
  if (!/^\d+$/.test(quantity.trim()) || !/^\d+$/.test(points.trim())) return null;
  const total = Number(quantity) * Number(points);
  return total > 0 ? total : null;
}

/** The chosen product as a small card, with "Change". */
function ChosenProduct({
  product,
  onChange,
  disabled,
}: {
  product: QrPickerProduct;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imageUrl}
        alt=""
        decoding="async"
        className="size-12 shrink-0 rounded-md bg-muted object-cover"
      />
      <div className="grid min-w-0 flex-1 gap-0.5 text-sm">
        <p className="font-semibold break-words">{product.name}</p>
        <p className="text-xs break-words text-muted-foreground">
          {product.sku} · {product.brand.name} ·{" "}
          {product.category.path.map((step) => step.name).join(PATH_SEPARATOR)}
        </p>
        {product.notes.map((note) => (
          <p key={note} className="flex items-start gap-1 text-xs text-warning">
            <TriangleAlert className="mt-px size-3 shrink-0" aria-hidden />
            {note}
          </p>
        ))}
      </div>
      {onChange ? (
        <Button type="button" variant="outline" size="sm" onClick={onChange} disabled={disabled}>
          Change
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Make a QR batch (`qr.generate`, DEC-275): pick a switched-on product (searched on the
 * server), the number of codes and the points per code, with a live total. "Make batch"
 * first shows a review (a batch can't be deleted, only voided); "Yes, make it" sends it
 * and opens the new batch's page. Mounted only while open, so every opening starts fresh.
 */
export function MakeBatchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const create = useCreateQrBatch();
  const [product, setProduct] = useState<QrPickerProduct | null>(null);
  const [step, setStep] = useState<"details" | "review">("details");
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: START });
  const { errors } = form.formState;
  const [quantity, pointsPerCode] = useWatch({
    control: form.control,
    name: ["quantity", "pointsPerCode"],
  });
  const total = totalOf(quantity, pointsPerCode);
  const pending = create.isPending;

  const pickProduct = (next: QrPickerProduct | null) => {
    setProduct(next);
    form.setValue("productId", next?.id ?? "", { shouldValidate: Boolean(next) });
    setFormError(null);
  };

  const review = form.handleSubmit(() => {
    setFormError(null);
    setStep("review");
  });

  const make = form.handleSubmit((values) => {
    setFormError(null);
    const notes = values.notes.trim().replace(/\s+/g, " ");
    create.mutate(
      {
        productId: values.productId,
        quantity: Number(values.quantity),
        pointsPerCode: Number(values.pointsPerCode),
        ...(notes ? { notes } : {}),
      },
      {
        onSuccess: (reply) => {
          toast.success(reply.message ?? "QR batch created");
          onOpenChange(false);
          router.push(`/qr-batches/${reply.data.id}`);
        },
        onError: (error) => {
          // Back to the fields, with each message under its field or in the red box.
          setStep("details");
          if (!applyServerFieldErrors(error, form.setError, FIELDS)) {
            setFormError(errorMessage(error));
          }
        },
      },
    );
  });

  if (step === "review" && product && total !== null) {
    return (
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Make this batch?"
        description="A batch can't be deleted or changed after it is made. It can only be voided."
        submitLabel={pending ? "Making codes…" : "Yes, make it"}
        pending={pending}
        onSubmit={make}
        formError={formError}
        cancelLabel="Back"
        onCancel={() => setStep("details")}
        size="md"
      >
        <div className="grid gap-4">
          <ChosenProduct product={product} />
          <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center">
            <div>
              <dt className="text-xs text-muted-foreground">Codes</dt>
              <dd className="font-semibold tabular-nums">{formatCount(Number(quantity))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Points per code</dt>
              <dd className="font-semibold tabular-nums">{formatPoints(Number(pointsPerCode))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total if all scanned</dt>
              <dd className="font-semibold tabular-nums">{formatPoints(total)}</dd>
              <dd className="text-xs text-muted-foreground">{formatRupees(total)}</dd>
            </div>
          </dl>
          {form.getValues("notes").trim() ? (
            <p className="text-sm break-words">
              <span className="text-muted-foreground">Notes: </span>
              {form.getValues("notes").trim()}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {pending
              ? "Making the codes. A big batch can take several seconds; please keep this page open."
              : "After it is made, download the ZIP for printing from the batch's page."}
          </p>
        </div>
      </FormDialog>
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Make a QR batch"
      description="Every code in a batch is for one product and carries the same points (1 point = ₹1)."
      submitLabel="Make batch"
      onSubmit={review}
      formError={formError}
      size="md"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.productId)}>
          <FieldLabel>Product</FieldLabel>
          {product ? (
            <ChosenProduct product={product} onChange={() => pickProduct(null)} />
          ) : (
            <QrProductSearchList
              selectedId={null}
              onSelect={pickProduct}
              listClassName="max-h-56"
            />
          )}
          <FieldDescription>
            Only switched-on products. A product whose brand or category is off can still get codes;
            it is just hidden in the app.
          </FieldDescription>
          <FieldError errors={[errors.productId]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.quantity)}>
            <FieldLabel htmlFor="qr-quantity">Number of codes</FieldLabel>
            <Input
              id="qr-quantity"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 3000"
              aria-invalid={Boolean(errors.quantity)}
              {...form.register("quantity")}
            />
            <FieldError errors={[errors.quantity]} />
          </Field>
          <Field data-invalid={Boolean(errors.pointsPerCode)}>
            <FieldLabel htmlFor="qr-points">Points per code</FieldLabel>
            <Input
              id="qr-points"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 25"
              aria-invalid={Boolean(errors.pointsPerCode)}
              {...form.register("pointsPerCode")}
            />
            <FieldError errors={[errors.pointsPerCode]} />
          </Field>
        </div>

        <p className="rounded-lg bg-muted px-3 py-2 text-sm" aria-live="polite">
          {total === null ? (
            <span className="text-muted-foreground">
              The batch&apos;s total shows here once both numbers are filled in.
            </span>
          ) : (
            <>
              Worth <span className="font-semibold tabular-nums">{formatPoints(total)}</span> (
              {formatRupees(total)}) if every code is scanned.
            </>
          )}
        </p>

        <Field data-invalid={Boolean(errors.notes)}>
          <FieldLabel htmlFor="qr-notes">Notes (optional)</FieldLabel>
          <Textarea
            id="qr-notes"
            rows={2}
            maxLength={500}
            placeholder="e.g. November print run, Pune depot"
            aria-invalid={Boolean(errors.notes)}
            {...form.register("notes")}
          />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FieldGroup>
    </FormDialog>
  );
}
