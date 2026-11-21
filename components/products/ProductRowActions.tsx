"use client";

import { MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductActions } from "@/hooks/catalog/useProducts";
import type { Product } from "@/lib/api/catalog.api";
import { errorMessage } from "@/lib/forms/serverErrors";

type Open = "edit" | "toggle" | null;

/**
 * The "…" menu on a product row (DEC-267): Edit, Switch off / on (with a confirm). Pop-ups
 * mount only while open, so each opening starts fresh.
 */
export function ProductRowActions({ product }: { product: Product }) {
  const [open, setOpen] = useState<Open>(null);
  const { deactivate, reactivate } = useProductActions();
  const isActive = product.active;
  const toggle = isActive ? deactivate : reactivate;
  const close = () => setOpen(null);

  const runToggle = () =>
    toggle.mutate(product.id, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? (isActive ? "Product switched off" : "Product switched on"));
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
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`} />
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
        <ProductFormDialog product={product} open onOpenChange={(next) => !next && close()} />
      ) : null}
      {open === "toggle" ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && close()}
          title={isActive ? `Switch off ${product.name}?` : `Switch on ${product.name}?`}
          description={
            isActive
              ? "It disappears from the partner and field apps. No new requests and no new QR batches for it. Stickers already printed still earn points, and old records stay as they are."
              : "It shows in the apps again, as long as its brand and category are on."
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
