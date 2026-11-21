"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { ZonePicker } from "@/components/common/ZonePicker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { useAsmOptions } from "@/hooks/data/useAsmOptions";
import { useZoneOptions } from "@/hooks/data/useZoneOptions";
import { useStaffActions } from "@/hooks/staff/useStaffActions";
import { errorMessage } from "@/lib/forms/serverErrors";
import { useAuthStore } from "@/stores/auth.store";
import type { StaffDetail } from "@/types/staff";

interface MoveStaffDialogProps {
  member: StaffDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Move a staff member (`POST /users/:id/transfer`, DEC-066):
 * - Sales Executive → another active ASM (Zonal Head: in their zone; Admin: any zone, pick
 *   the zone first). Their partners stay with the old ASM, with no Sales Executive.
 * - ASM → another zone that has a Zonal Head (Admin only). Refused while they still have
 *   Sales Executives or partners.
 * Both are logged out. Open tasks / open requests → the server's 409 message.
 */
export function MoveStaffDialog({ member, open, onOpenChange }: MoveStaffDialogProps) {
  const isSe = member.role.key === "sales_executive";
  const isZonalHead = useAuthStore((state) => state.user?.role.key === "zonal_head");
  const [zoneId, setZoneId] = useState<string | null>(member.zone?.id ?? null);
  const [asmId, setAsmId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const { transfer } = useStaffActions(member.id);

  const asms = useAsmOptions(isZonalHead ? null : zoneId, open && isSe && Boolean(zoneId));
  const zones = useZoneOptions(open && !isSe);

  const asmOptions = Object.fromEntries(
    (asms.data ?? [])
      .filter((asm) => asm.id !== member.parent?.id)
      .map((asm) => [asm.id, asm.name ?? "Unnamed ASM"]),
  );
  // An ASM can go only to another zone that has a Zonal Head (their new manager).
  const zoneOptions = Object.fromEntries(
    (zones.data ?? [])
      .filter((zone) => zone.id !== member.zone?.id && zone.zonalHead)
      .map((zone) => [zone.id, `${zone.name} · ${zone.zonalHead?.name ?? "Zonal Head"}`]),
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const target = isSe
      ? asmId
        ? { asmId }
        : null
      : zoneId && zoneId !== member.zone?.id
        ? { zoneId }
        : null;
    if (!target) {
      setProblem(isSe ? "Pick the new ASM." : "Pick the new zone.");
      return;
    }
    transfer.mutate(target, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? "Staff moved");
        onOpenChange(false);
      },
      onError: (error) => setProblem(errorMessage(error)),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isSe ? "Move to another ASM" : "Move to another zone"}
      description={
        isSe
          ? `Now under ${member.parent?.name ?? "no ASM"}. Their partners stay with the old ASM, with no Sales Executive. They are logged out; past records keep the old ASM.`
          : `Now in ${member.zone?.name ?? "no zone"}. They must have no Sales Executives or partners left. Their new manager is the new zone's Zonal Head. They are logged out.`
      }
      submitLabel="Move"
      pending={transfer.isPending}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        {isSe ? (
          <>
            {!isZonalHead ? (
              <Field>
                <FieldLabel htmlFor="move-staff-zone">Zone</FieldLabel>
                <ZonePicker
                  id="move-staff-zone"
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
                options={asmOptions}
                allLabel={
                  !zoneId
                    ? "Pick a zone first"
                    : asms.isPending
                      ? "Loading ASMs…"
                      : Object.keys(asmOptions).length === 0
                        ? "No other active ASM here"
                        : "Pick an ASM"
                }
                disabled={!zoneId || Object.keys(asmOptions).length === 0}
                className="w-full"
              />
              <FieldError>{problem}</FieldError>
            </Field>
          </>
        ) : (
          <Field data-invalid={Boolean(problem)}>
            <FieldLabel>New zone</FieldLabel>
            <FilterSelect
              label="New zone"
              value={zoneId === member.zone?.id ? null : zoneId}
              onChange={(next) => {
                setZoneId(next);
                setProblem(null);
              }}
              options={zoneOptions}
              allLabel={
                zones.isPending
                  ? "Loading zones…"
                  : Object.keys(zoneOptions).length === 0
                    ? "No other zone with a Zonal Head"
                    : "Pick a zone"
              }
              disabled={zones.isPending || Object.keys(zoneOptions).length === 0}
              className="w-full"
            />
            <FieldDescription>Only active zones with a Zonal Head are listed.</FieldDescription>
            <FieldError>{problem}</FieldError>
          </Field>
        )}
      </div>
    </FormDialog>
  );
}
