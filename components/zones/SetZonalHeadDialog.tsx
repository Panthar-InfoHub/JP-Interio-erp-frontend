"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { useSpareZonalHeads, useZoneActions } from "@/hooks/zones/useZones";
import type { Zone } from "@/lib/api/zones.api";
import { formatPhone } from "@/lib/format/phone";
import { errorMessage } from "@/lib/forms/serverErrors";

interface SetZonalHeadDialogProps {
  zone: Zone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Put a Zonal Head in charge of a zone, or replace the current one (Admin, DEC-067).
 * Only active Zonal Heads with no zone can be picked; add one first in Staff. The zone's
 * ASMs then report to the new head; the old head stays active with no zone. Both are
 * logged out. Refused while the old head has unfinished tasks (409 OPEN_TASKS).
 */
export function SetZonalHeadDialog({ zone, open, onOpenChange }: SetZonalHeadDialogProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const spare = useSpareZonalHeads(open);
  const { setZonalHead } = useZoneActions();
  const current = zone.zonalHead;
  const asmCount = zone.counts?.asms ?? 0;

  const options = Object.fromEntries(
    (spare.data ?? []).map((person) => [
      person.id,
      `${person.name ?? "Unnamed"} · ${formatPhone(person.phone)}`,
    ]),
  );
  const none = !spare.isPending && !spare.isError && Object.keys(options).length === 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setProblem("Pick the Zonal Head to put in charge.");
      return;
    }
    setZonalHead.mutate(
      { id: zone.id, userId },
      {
        onSuccess: (reply) => {
          toast.success(reply.message ?? "Zonal Head set");
          onOpenChange(false);
        },
        onError: (error) => setProblem(errorMessage(error)),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        current ? `Replace the Zonal Head of ${zone.name}` : `Set the Zonal Head of ${zone.name}`
      }
      description={
        current
          ? `Now: ${current.name ?? "Unnamed"} (${formatPhone(current.phone)}). They will stay active with no zone; you can then switch them off or put them in charge of another zone.`
          : "This zone has no Zonal Head yet."
      }
      submitLabel={current ? "Replace Zonal Head" : "Put in charge"}
      pending={setZonalHead.isPending}
      onSubmit={submit}
    >
      <Field data-invalid={Boolean(problem)}>
        <FieldLabel>New Zonal Head</FieldLabel>
        <FilterSelect
          label="New Zonal Head"
          value={userId}
          onChange={(next) => {
            setUserId(next);
            setProblem(null);
          }}
          options={options}
          allLabel={
            spare.isPending
              ? "Loading Zonal Heads…"
              : none
                ? "No free Zonal Head"
                : "Pick a Zonal Head"
          }
          disabled={spare.isPending || none}
          className="w-full"
        />
        <FieldDescription>
          {none
            ? "Only active Zonal Heads with no zone can be picked. Add one in Staff first (role Zonal Head, no zone)."
            : `Only Zonal Heads with no zone are listed. ${asmCount} ASM(s) in this zone will report to them. Both people are logged out.`}
        </FieldDescription>
        <FieldError>{spare.isError ? errorMessage(spare.error) : problem}</FieldError>
      </Field>
    </FormDialog>
  );
}
