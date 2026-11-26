"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialog } from "@/components/common/FormDialog";
import { ErrorState } from "@/components/common/StateMessages";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubAdminActions, useSubAdminAreas } from "@/hooks/sub-admins/useSubAdmins";
import type { Area, SubAdminAreas } from "@/lib/api/subAdmins.api";
import { areaLabel, areaUnlocks, SUB_ADMIN_AREAS } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/format/date";
import { errorMessage } from "@/lib/forms/serverErrors";

const schema = z.object({ areas: z.array(z.enum(SUB_ADMIN_AREAS as [Area, ...Area[]])) });
type FormValues = z.infer<typeof schema>;

interface EditAreasDialogProps {
  subAdmin: { id: string; name: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AreasForm({
  current,
  onOpenChange,
}: {
  current: SubAdminAreas;
  onOpenChange: (open: boolean) => void;
}) {
  const { setAreas } = useSubAdminActions();
  const [formError, setFormError] = useState<string | null>(null);
  const held = new Map(current.areas.map((item) => [item.area, item]));
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { areas: current.areas.map((item) => item.area) },
  });
  const ticked = useWatch({ control: form.control, name: "areas" });

  const save = form.handleSubmit(({ areas }) => {
    setFormError(null);
    // Keep the screen's order so "the same list" is easy to see on the server too.
    const ordered = SUB_ADMIN_AREAS.filter((area) => areas.includes(area));
    setAreas.mutate(
      { id: current.id, areas: ordered },
      {
        onSuccess: (reply) => {
          if (reply.data.changed) toast.success(reply.message ?? "Areas updated");
          else toast.info(reply.message ?? "No change");
          onOpenChange(false);
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  });

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={`Areas for ${current.name ?? "this Sub-Admin"}`}
      description="What they may do changes at once. Their menus update the next time their panel loads (reload or log in again)."
      submitLabel="Save areas"
      pending={setAreas.isPending}
      onSubmit={save}
      formError={formError}
      size="md"
    >
      <Controller
        control={form.control}
        name="areas"
        render={({ field }) => (
          <div className="grid gap-4">
            {SUB_ADMIN_AREAS.map((area) => {
              const given = held.get(area);
              return (
                <Field key={area} orientation="horizontal">
                  <Checkbox
                    id={`edit-area-${area}`}
                    checked={field.value.includes(area)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...field.value, area]
                          : field.value.filter((item) => item !== area),
                      )
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`edit-area-${area}`}>{areaLabel(area)}</FieldLabel>
                    <FieldDescription>
                      {areaUnlocks(area)}
                      {given ? (
                        <span className="block">
                          Given by {given.grantedBy?.name ?? "Admin"} on{" "}
                          {formatDateTime(given.grantedAt)}
                        </span>
                      ) : null}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              );
            })}
          </div>
        )}
      />
      {ticked.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          With no areas they can only browse the catalog and do tasks given to them.
        </p>
      ) : null}
    </FormDialog>
  );
}

/**
 * Give or take away a Sub-Admin's areas (Admin only, DEC-301, DEC-302): 6 tick boxes with
 * what each unlocks and who gave the ones already held; saves the full list. Works for any
 * status. Loads the current areas first. The caller mounts this only while open.
 */
export function EditAreasDialog({ subAdmin, open, onOpenChange }: EditAreasDialogProps) {
  const current = useSubAdminAreas(subAdmin.id, open);

  if (current.data) return <AreasForm current={current.data} onOpenChange={onOpenChange} />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Areas for {subAdmin.name ?? "this Sub-Admin"}</DialogTitle>
          <DialogDescription>Loading their areas…</DialogDescription>
        </DialogHeader>
        {current.error ? (
          <ErrorState error={current.error} onRetry={() => void current.refetch()} />
        ) : (
          <div className="grid gap-3" aria-busy>
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
