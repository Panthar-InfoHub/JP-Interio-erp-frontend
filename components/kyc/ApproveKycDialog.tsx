"use client";

import { useState } from "react";

import { FilterSelect } from "@/components/common/FilterSelect";
import { FormDialog } from "@/components/common/FormDialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { errorMessage } from "@/lib/forms/serverErrors";
import type { KycDetail } from "@/types/kyc";

interface ApproveKycDialogProps {
  partner: KycDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  /** `asmId` only for a self sign-up. Reject the promise to keep the dialog open. */
  onApprove: (asmId: string | undefined) => Promise<unknown>;
}

/**
 * "Approve KYC for <name>?" (DEC-244). A self sign-up must get an ASM: the active ASMs of
 * the partner's zone (`asmChoices`). Approving can't be undone.
 */
export function ApproveKycDialog({
  partner,
  open,
  onOpenChange,
  pending,
  onApprove,
}: ApproveKycDialogProps) {
  const [asmId, setAsmId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const name = partner.basicInfo?.name ?? "this partner";
  const needsAsm = partner.needsAsmPick;
  const options = Object.fromEntries(
    partner.asmChoices.map((asm) => [asm.id, asm.name ?? asm.phone]),
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (needsAsm && !asmId) {
      setProblem("Pick the ASM who will look after this partner.");
      return;
    }
    onApprove(needsAsm ? (asmId ?? undefined) : undefined).catch((error: unknown) =>
      setProblem(errorMessage(error)),
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setAsmId(null);
          setProblem(null);
        }
        onOpenChange(next);
      }}
      title={`Approve KYC for ${name}?`}
      description="The partner becomes verified and can start scanning and cashing out. This can't be undone."
      submitLabel="Approve"
      pending={pending}
      onSubmit={submit}
    >
      {needsAsm ? (
        <Field data-invalid={Boolean(problem)}>
          <FieldLabel>ASM who will look after them</FieldLabel>
          <p className="text-xs text-muted-foreground">
            This partner signed up on their own. Pick an active ASM of{" "}
            {partner.basicInfo?.zone?.name ?? "their zone"}.
          </p>
          <FilterSelect
            label="ASM"
            value={asmId}
            onChange={(next) => {
              setAsmId(next);
              setProblem(null);
            }}
            options={options}
            allLabel={
              partner.asmChoices.length === 0 ? "No active ASM in this zone" : "Pick an ASM"
            }
            disabled={partner.asmChoices.length === 0}
            className="w-full"
          />
          <FieldError>{problem}</FieldError>
        </Field>
      ) : problem ? (
        <p className="text-sm text-destructive">{problem}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Looked after by {partner.asm?.name ?? "—"}
          {partner.salesExecutive ? ` and ${partner.salesExecutive.name ?? "—"}` : ""}.
        </p>
      )}
    </FormDialog>
  );
}
