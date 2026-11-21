"use client";

import { MoreHorizontal, Pencil, Power, PowerOff, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetZonalHeadDialog } from "@/components/zones/SetZonalHeadDialog";
import { ZoneFormDialog } from "@/components/zones/ZoneFormDialog";
import { useZoneActions } from "@/hooks/zones/useZones";
import type { Zone } from "@/lib/api/zones.api";
import { errorMessage } from "@/lib/forms/serverErrors";

type Open = "edit" | "head" | "toggle" | null;

/**
 * The "…" menu on a zone row (Admin, DEC-261): Edit, Set / Replace Zonal Head (active
 * zones only, as the server requires), Switch off / on. The server's refusals (people
 * still in the zone, open tasks …) show as its own message. Pop-ups mount only while
 * open, so each opening starts fresh.
 */
export function ZoneRowActions({ zone }: { zone: Zone }) {
  const [open, setOpen] = useState<Open>(null);
  const { deactivate, reactivate } = useZoneActions();
  const isActive = zone.status === "active";
  const toggle = isActive ? deactivate : reactivate;
  const close = () => setOpen(null);

  const runToggle = () =>
    toggle.mutate(zone.id, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? (isActive ? "Zone switched off" : "Zone switched on"));
        close();
      },
      onError: (error) => {
        toast.error(errorMessage(error));
        close();
      },
    });

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${zone.name}`} />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setOpen("edit")}>
            <Pencil />
            Edit details
          </DropdownMenuItem>
          {isActive ? (
            <DropdownMenuItem onClick={() => setOpen("head")}>
              <UserCog />
              {zone.zonalHead ? "Replace Zonal Head" : "Set Zonal Head"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          {isActive ? (
            <DropdownMenuItem variant="destructive" onClick={() => setOpen("toggle")}>
              <PowerOff />
              Switch off
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpen("toggle")}>
              <Power />
              Switch on
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {open === "edit" ? (
        <ZoneFormDialog zone={zone} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "head" ? (
        <SetZonalHeadDialog zone={zone} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "toggle" ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && close()}
          title={isActive ? `Switch off ${zone.name}?` : `Switch on ${zone.name}?`}
          description={
            isActive
              ? "Only an empty zone can be switched off: everyone in it must be moved or switched off first. No one can be added to an inactive zone."
              : "Staff and partners can be added to the zone again."
          }
          confirmLabel={isActive ? "Switch off" : "Switch on"}
          destructive={isActive}
          pending={toggle.isPending}
          onConfirm={runToggle}
        />
      ) : null}
    </div>
  );
}
