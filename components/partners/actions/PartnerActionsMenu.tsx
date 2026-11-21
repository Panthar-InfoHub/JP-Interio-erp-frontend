"use client";

import { ArrowRightLeft, ChevronDown, Pencil, Smartphone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChangePhoneDialog } from "@/components/partners/actions/ChangePhoneDialog";
import { EditPartnerDialog } from "@/components/partners/actions/EditPartnerDialog";
import { MovePartnerDialog } from "@/components/partners/actions/MovePartnerDialog";
import { RemoveDraftDialog } from "@/components/partners/RemoveDraftDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@/hooks/auth/usePermission";
import { formatPhone } from "@/lib/format/phone";
import type { Partner360 } from "@/types/partner";

type Open = "edit" | "phone" | "move" | "remove" | null;

/**
 * "Actions" on Partner 360 (DEC-242, DEC-247). Each item shows only when this person may
 * do it and the partner's state allows it (the server checks again):
 * - Edit details / Change mobile: `partners.edit`, verified partners only.
 * - Move to another ASM: `partners.transfer`, a partner who has an ASM and isn't deactivated.
 * - Remove this draft: `partners.remove_draft` (Admin), an unfinished sign-up only.
 * Dialogs mount only while open, so each opening starts fresh.
 */
export function PartnerActionsMenu({ partner }: { partner: Partner360 }) {
  const can = useCan();
  const router = useRouter();
  const [open, setOpen] = useState<Open>(null);
  const verified = partner.kycState === "verified";
  const notDeactivated = partner.accountStatus !== "deactivated";

  const canEdit = can("partners.edit") && verified && notDeactivated;
  const canMove = can("partners.transfer") && Boolean(partner.asm) && notDeactivated;
  const canRemoveDraft =
    can("partners.remove_draft") && partner.kycState === "not_submitted" && notDeactivated;
  if (!canEdit && !canMove && !canRemoveDraft) return null;

  const close = () => setOpen(null);
  const label =
    partner.basicInfo?.name ?? formatPhone(partner.basicInfo?.phone ?? partner.setUpBy?.phone);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Actions
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {canEdit ? (
            <>
              <DropdownMenuItem onClick={() => setOpen("edit")}>
                <Pencil />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen("phone")}>
                <Smartphone />
                Change mobile number
              </DropdownMenuItem>
            </>
          ) : null}
          {canMove ? (
            <DropdownMenuItem onClick={() => setOpen("move")}>
              <ArrowRightLeft />
              Move to another ASM
            </DropdownMenuItem>
          ) : null}
          {canRemoveDraft ? (
            <>
              {canEdit || canMove ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem variant="destructive" onClick={() => setOpen("remove")}>
                <Trash2 />
                Remove this draft
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {open === "edit" ? (
        <EditPartnerDialog partner={partner} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "phone" ? (
        <ChangePhoneDialog partner={partner} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "move" ? (
        <MovePartnerDialog partner={partner} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "remove" ? (
        <RemoveDraftDialog
          partnerId={partner.partnerId}
          label={label}
          open
          onOpenChange={(next) => !next && close()}
          // The removed draft no longer exists (the server answers 404): go to the list.
          onRemoved={() => router.push("/partners")}
        />
      ) : null}
    </>
  );
}
