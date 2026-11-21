"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { ProductImageField } from "@/components/products/ProductImageField";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCategoryTree } from "@/hooks/catalog/useCategories";
import { useBrandOptions, useProductActions } from "@/hooks/catalog/useProducts";
import type { Product, ProductUpdate } from "@/lib/api/catalog.api";
import { flattenCategoryPaths, PATH_SEPARATOR } from "@/lib/catalog/categoryTree";
import { applyServerFieldErrors, errorMessage } from "@/lib/forms/serverErrors";

const FIELDS = [
  "sku",
  "name",
  "brandId",
  "categoryId",
  "mrp",
  "thickness",
  "size",
  "grade",
  "imageUrl",
] as const;
type FieldName = (typeof FIELDS)[number];
type FormValues = Record<FieldName, string>;

/** Same limits as the server (backend product.schema.ts). */
const schema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(50, "At most 50 characters"),
  name: z.string().trim().min(1, "Name is required").max(200, "At most 200 characters"),
  brandId: z.string().min(1, "Choose a brand"),
  categoryId: z.string().min(1, "Choose a category"),
  mrp: z
    .string()
    .trim()
    .min(1, "MRP is required")
    .regex(/^\d{1,10}(\.\d{1,2})?$/, "An amount in rupees with at most 2 decimals, e.g. 1250.50")
    .refine((value) => Number(value) > 0, "MRP must be more than 0"),
  thickness: z.string().trim().max(50, "At most 50 characters"),
  size: z.string().trim().max(100, "At most 100 characters"),
  grade: z.string().trim().max(50, "At most 50 characters"),
  imageUrl: z.string().min(1, "Add the product image"),
});

/** The server squeezes inner spaces; compare and send the same way. */
const clean = (value: string) => value.trim().replace(/\s+/g, " ");

function startValues(product: Product | null): FormValues {
  return {
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    brandId: product?.brand.id ?? "",
    categoryId: product?.category.id ?? "",
    mrp: product?.mrp ?? "",
    thickness: product?.thickness ?? "",
    size: product?.size ?? "",
    grade: product?.grade ?? "",
    imageUrl: product?.imageUrl ?? "",
  };
}

interface ProductFormDialogProps {
  /** null = add a new product. */
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add or edit a product (`products.manage`, DEC-267, DEC-270). The pickers list only
 * brands that are on and categories that are really on; a product's current one that is
 * now off still shows, marked "Off — current". The SKU is read-only once the product has
 * a QR batch (DEC-122). Editing sends only what changed. Clashes and refusals show in the
 * red box (DEC-268). Mounted only while open, so every opening starts fresh.
 */
export function ProductFormDialog({ product, open, onOpenChange }: ProductFormDialogProps) {
  const isEdit = product !== null;
  const skuLocked = product?.skuLocked ?? false;
  const initial = startValues(product);
  const { create, update } = useProductActions();
  const brands = useBrandOptions();
  const categories = useCategoryTree();
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const { errors } = form.formState;
  const pending = create.isPending || update.isPending;

  const brandOptions: Record<string, string> = {};
  for (const brand of brands.data ?? []) {
    if (brand.active) brandOptions[brand.id] = brand.name;
    else if (brand.id === product?.brand.id)
      brandOptions[brand.id] = `${brand.name} — Off, current`;
  }
  if (product && !(product.brand.id in brandOptions) && brands.data) {
    brandOptions[product.brand.id] = `${product.brand.name} — Off, current`;
  }

  const categoryOptions: Record<string, string> = {};
  for (const option of flattenCategoryPaths(categories.data ?? [])) {
    if (option.effectiveActive) categoryOptions[option.id] = option.path;
    else if (option.id === product?.category.id) {
      categoryOptions[option.id] = `${option.path} — Off, current`;
    }
  }

  const onError = (error: unknown) => {
    if (!applyServerFieldErrors(error, form.setError, FIELDS)) setFormError(errorMessage(error));
  };
  const onDone = (message: string | undefined, fallback: string) => {
    toast.success(message ?? fallback);
    onOpenChange(false);
  };

  const save = form.handleSubmit((values) => {
    setFormError(null);
    if (uploading) {
      setFormError("Wait for the image to finish uploading.");
      return;
    }
    const next = {
      sku: clean(values.sku),
      name: clean(values.name),
      brandId: values.brandId,
      categoryId: values.categoryId,
      mrp: values.mrp.trim(),
      thickness: clean(values.thickness),
      size: clean(values.size),
      grade: clean(values.grade),
      imageUrl: values.imageUrl,
    };

    if (!isEdit) {
      create.mutate(
        {
          sku: next.sku,
          name: next.name,
          brandId: next.brandId,
          categoryId: next.categoryId,
          mrp: next.mrp,
          imageUrl: next.imageUrl,
          ...(next.thickness ? { thickness: next.thickness } : {}),
          ...(next.size ? { size: next.size } : {}),
          ...(next.grade ? { grade: next.grade } : {}),
        },
        { onSuccess: (reply) => onDone(reply.message, "Product added"), onError },
      );
      return;
    }

    const changes: ProductUpdate = {};
    if (!skuLocked && next.sku !== initial.sku) changes.sku = next.sku;
    if (next.name !== initial.name) changes.name = next.name;
    if (next.brandId !== initial.brandId) changes.brandId = next.brandId;
    if (next.categoryId !== initial.categoryId) changes.categoryId = next.categoryId;
    if (Number(next.mrp) !== Number(initial.mrp)) changes.mrp = next.mrp;
    if (next.thickness !== initial.thickness) changes.thickness = next.thickness || null;
    if (next.size !== initial.size) changes.size = next.size || null;
    if (next.grade !== initial.grade) changes.grade = next.grade || null;
    if (next.imageUrl !== initial.imageUrl) changes.imageUrl = next.imageUrl;
    if (Object.keys(changes).length === 0) {
      toast.info("Nothing changed");
      onOpenChange(false);
      return;
    }
    update.mutate(
      { id: product.id, changes },
      { onSuccess: (reply) => onDone(reply.message, "Product updated"), onError },
    );
  });

  const textField = (
    name: Exclude<FieldName, "brandId" | "categoryId" | "imageUrl">,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
    hint?: React.ReactNode,
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`product-${name}`}>{label}</FieldLabel>
      <Input
        id={`product-${name}`}
        aria-invalid={Boolean(errors[name])}
        autoComplete="off"
        {...props}
        {...form.register(name)}
      />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  const picker = (
    name: "brandId" | "categoryId",
    label: string,
    options: Record<string, string>,
    loading: boolean,
    hint: string,
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel>{label}</FieldLabel>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <FilterSelect
            label={label}
            value={field.value || null}
            onChange={(value) => field.onChange(value ?? "")}
            options={options}
            allLabel={loading ? "Loading…" : `Choose a ${label.toLowerCase()}`}
            className="w-full"
          />
        )}
      />
      <FieldDescription>{hint}</FieldDescription>
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit ${product.name}` : "Add a product"}
      description={
        isEdit
          ? "Switching the product off or on is a separate action."
          : "It shows in the apps once its brand and category are on."
      }
      submitLabel={isEdit ? "Save changes" : "Add product"}
      pending={pending}
      onSubmit={save}
      formError={formError}
      size="md"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <ProductImageField
              value={field.value}
              onChange={(url) => {
                field.onChange(url);
                form.clearErrors("imageUrl");
              }}
              onBusyChange={setUploading}
              error={errors.imageUrl?.message}
              disabled={pending}
            />
          )}
        />
        {textField("name", "Name", { placeholder: "e.g. Marine BWP 18mm" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {textField(
            "sku",
            "SKU",
            {
              placeholder: "e.g. BWP-18",
              readOnly: skuLocked,
              className: skuLocked ? "opacity-60" : undefined,
            },
            skuLocked ? (
              <span className="inline-flex items-center gap-1">
                <Lock className="size-3" aria-hidden />
                Locked: this product already has QR batches.
              </span>
            ) : (
              "Unique; capitals and spaces don't count. Locked after the first QR batch."
            ),
          )}
          {textField("mrp", "MRP (₹)", { placeholder: "e.g. 3250.50", inputMode: "decimal" })}
        </div>
        {picker(
          "brandId",
          "Brand",
          brandOptions,
          brands.isPending,
          "Only brands that are switched on.",
        )}
        {picker(
          "categoryId",
          "Category",
          categoryOptions,
          categories.isPending,
          `Any level, e.g. Plywood${PATH_SEPARATOR}Marine. Only categories that are switched on.`,
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {textField("thickness", "Thickness (optional)", { placeholder: "e.g. 18 mm" })}
          {textField("size", "Size (optional)", { placeholder: "e.g. 8 x 4 ft" })}
          {textField("grade", "Grade (optional)", { placeholder: "e.g. BWP" })}
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
