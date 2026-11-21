"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { ZonePicker } from "@/components/common/ZonePicker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useAsmOptions } from "@/hooks/data/useAsmOptions";
import { usePartnerActions } from "@/hooks/partners/usePartnerActions";
import { errorMessage } from "@/lib/forms/serverErrors";
import { useAuthStore } from "@/stores/auth.store";
import type { Partner360 } from "@/types/partner";

interface MovePartnerDialogProps {
  partner: Partner360;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Move a partner to another ASM. Zonal Head: an ASM in their own zone; Admin: any zone
 * (pick the zone first). The zone follows the new ASM; the Sales Executive is removed.
 * Refused while the partner has an open request (server: 409 OPEN_REQUESTS).
 */
export function MovePartnerDialog({ partner, open, onOpenChange }: MovePartnerDialogProps) {
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const currentZoneId = partner.basicInfo?.zone?.id ?? null;
  const [zoneId, setZoneId] = useState<string | null>(currentZoneId);
  const [asmId, setAsmId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const { transfer } = usePartnerActions(partner.partnerId);
  const asms = useAsmOptions(isZonalHead ? null : zoneId, open);

  const options = Object.fromEntries(
    (asms.data ?? [])
      .filter((asm) => asm.id !== partner.asm?.id)
      .map((asm) => [asm.id, asm.name ?? "Unnamed ASM"]),
  );

  const close = (next: boolean) => {
    if (!next) {
      setZoneId(currentZoneId);
      setAsmId(null);
      setProblem(null);
    }
    onOpenChange(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!asmId) {
      setProblem("Pick the new ASM.");
      return;
    }
    transfer.mutate(asmId, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? "Partner moved");
        close(false);
      },
      onError: (error) => setProblem(errorMessage(error)),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={close}
      title="Move to another ASM"
      description={`Now with ${partner.asm?.name ?? "no ASM"}. The partner's Sales Executive will be removed; past records keep the old ASM.`}
      submitLabel="Move partner"
      pending={transfer.isPending}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        {!isZonalHead ? (
          <Field>
            <FieldLabel htmlFor="move-zone">Zone</FieldLabel>
            <ZonePicker
              id="move-zone"
              value={zoneId}
              onChange={(next) => {
                setZoneId(next);
                setAsmId(null);
                setProblem(null);
              }}
              allLabel="Pick a zone"
              className="w-full"
            />
          </Field>
        ) : null}
        <Field data-invalid={Boolean(problem)}>
          <FieldLabel>New ASM</FieldLabel>
          <FilterSelect
            label="New ASM"
            value={asmId}
            onChange={(next) => {
              setAsmId(next);
              setProblem(null);
            }}
            options={options}
            allLabel={
              !isZonalHead && !zoneId
                ? "Pick a zone first"
                : asms.isPending
                  ? "Loading ASMs…"
                  : Object.keys(options).length === 0
                    ? "No other active ASM here"
                    : "Pick an ASM"
            }
            disabled={(!isZonalHead && !zoneId) || Object.keys(options).length === 0}
            className="w-full"
          />
          <FieldError>{problem}</FieldError>
        </Field>
      </div>
    </FormDialog>
  );
}
