"use client";

import { ArrowRightLeft, ChevronDown, Pencil, Power, PowerOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EditStaffDialog } from "@/components/staff/actions/EditStaffDialog";
import { MoveStaffDialog } from "@/components/staff/actions/MoveStaffDialog";
import { EditAreasDialog } from "@/components/sub-admins/EditAreasDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@/hooks/auth/usePermission";
import { useStaffActions } from "@/hooks/staff/useStaffActions";
import { errorMessage } from "@/lib/forms/serverErrors";
import { staffActionsFor } from "@/lib/staff/staffRules";
import { useAuthStore } from "@/stores/auth.store";
import type { StaffDetail } from "@/types/staff";

type Open = "edit" | "areas" | "move" | "toggle" | null;

/** What switching off means for each role (DEC-065), shown before confirming. */
function switchOffText(member: StaffDetail): string {
  switch (member.role.key) {
    case "sales_executive":
      return "They are logged out at once and can't log in again. Their partners go back to their ASM. Refused while they handle an unfinished request or have unfinished tasks.";
    case "asm":
      return "They are logged out at once and can't log in again. Refused while they still have Sales Executives or partners, or unfinished tasks.";
    case "zonal_head":
      return "They are logged out at once and can't log in again. Refused while they are in charge of a zone (replace them on Zones first) or have unfinished tasks.";
    default:
      return "They are logged out at once and can't log in again. Their areas are kept. Refused while they have unfinished tasks.";
  }
}

/**
 * "Actions" on a staff member's page (F6 T3): Edit, Edit areas (Sub-Admins, Admin only,
 * F13 DEC-302), Move, Switch off / on — each shown
 * only when this person may do it (`staffActionsFor`); the server checks again and its
 * refusal (open tasks, open requests, a team left …) is shown as its own message.
 * Pop-ups mount only while open, so each opening starts fresh.
 */
export function StaffActionsMenu({ member }: { member: StaffDetail }) {
  const can = useCan();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState<Open>(null);
  const { deactivate, reactivate } = useStaffActions(member.id);
  const flags = staffActionsFor(user ? { id: user.id, role: user.role.key } : null, can, member);
  // Sub-Admin areas: the Admin only (sub_admins.manage), any status (DEC-301, DEC-302).
  const canEditAreas = member.role.key === "sub_admin" && can("sub_admins.manage");
  if (!flags.edit && !flags.move && !flags.toggle && !canEditAreas) return null;

  const isOff = member.status === "deactivated";
  const toggle = isOff ? reactivate : deactivate;
  const close = () => setOpen(null);

  const runToggle = () =>
    toggle.mutate(undefined, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? (isOff ? "Switched back on" : "Switched off"));
        close();
      },
      onError: (error) => {
        toast.error(errorMessage(error));
        close();
      },
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Actions
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {flags.edit ? (
            <DropdownMenuItem onClick={() => setOpen("edit")}>
              <Pencil />
              Edit details
            </DropdownMenuItem>
          ) : null}
          {canEditAreas ? (
            <DropdownMenuItem onClick={() => setOpen("areas")}>
              <ShieldCheck />
              Edit areas
            </DropdownMenuItem>
          ) : null}
          {flags.move ? (
            <DropdownMenuItem onClick={() => setOpen("move")}>
              <ArrowRightLeft />
              {member.role.key === "sales_executive"
                ? "Move to another ASM"
                : "Move to another zone"}
            </DropdownMenuItem>
          ) : null}
          {flags.toggle ? (
            <>
              {flags.edit || flags.move || canEditAreas ? <DropdownMenuSeparator /> : null}
              {isOff ? (
                <DropdownMenuItem onClick={() => setOpen("toggle")}>
                  <Power />
                  Switch back on
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onClick={() => setOpen("toggle")}>
                  <PowerOff />
                  Switch off
                </DropdownMenuItem>
              )}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {open === "edit" ? (
        <EditStaffDialog member={member} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "areas" ? (
        <EditAreasDialog subAdmin={member} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "move" ? (
        <MoveStaffDialog member={member} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "toggle" ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && close()}
          title={
            isOff
              ? `Switch ${member.name ?? "this person"} back on?`
              : `Switch off ${member.name ?? "this person"}?`
          }
          description={
            isOff
              ? "They can log in again. Refused if their manager or zone is not active, or (Zonal Head) their zone already has another Zonal Head."
              : switchOffText(member)
          }
          confirmLabel={isOff ? "Switch back on" : "Switch off"}
          destructive={!isOff}
          pending={toggle.isPending}
          onConfirm={runToggle}
        />
      ) : null}
    </>
  );
}
