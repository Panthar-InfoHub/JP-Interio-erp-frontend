"use client";

import { MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrandFormDialog } from "@/components/brands/BrandFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrandActions } from "@/hooks/catalog/useBrands";
import type { Brand } from "@/lib/api/catalog.api";
import { errorMessage } from "@/lib/forms/serverErrors";

type Open = "edit" | "toggle" | null;

/**
 * The "…" menu on a brand row (DEC-267): Edit, Switch off / on (with a confirm). Pop-ups
 * mount only while open, so each opening starts fresh.
 */
export function BrandRowActions({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState<Open>(null);
  const { deactivate, reactivate } = useBrandActions();
  const isActive = brand.active;
  const toggle = isActive ? deactivate : reactivate;
  const close = () => setOpen(null);

  const runToggle = () =>
    toggle.mutate(brand.id, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? (isActive ? "Brand switched off" : "Brand switched on"));
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
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${brand.name}`} />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setOpen("edit")}>
            <Pencil />
            Edit details
          </DropdownMenuItem>
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
        <BrandFormDialog brand={brand} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "toggle" ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && close()}
          title={isActive ? `Switch off ${brand.name}?` : `Switch on ${brand.name}?`}
          description={
            isActive
              ? "Its products disappear from the partner and field apps and can't be requested. New QR batches for them are still allowed, and old records stay as they are."
              : "Its products show in the apps again, as long as the product itself and its category are on."
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
