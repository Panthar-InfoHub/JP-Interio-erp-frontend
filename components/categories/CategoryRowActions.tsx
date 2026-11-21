"use client";

import { FolderInput, FolderPlus, MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryNameDialog } from "@/components/categories/CategoryNameDialog";
import { MoveCategoryDialog } from "@/components/categories/MoveCategoryDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategoryActions } from "@/hooks/catalog/useCategories";
import type { CategoryTreeNode } from "@/lib/api/catalog.api";
import { errorMessage } from "@/lib/forms/serverErrors";

type Open = "add" | "rename" | "move" | "toggle" | null;

interface CategoryRowActionsProps {
  category: CategoryTreeNode;
  /** The whole tree, for the move picker. */
  tree: readonly CategoryTreeNode[];
}

/**
 * The "…" menu on a category line (DEC-267, DEC-269): Add sub-category (greyed while the
 * category is off, itself or above), Rename, Move, Switch off / on. Pop-ups mount only
 * while open, so each opening starts fresh.
 */
export function CategoryRowActions({ category, tree }: CategoryRowActionsProps) {
  const [open, setOpen] = useState<Open>(null);
  const { deactivate, reactivate } = useCategoryActions();
  const ownOn = category.active;
  const toggle = ownOn ? deactivate : reactivate;
  const close = () => setOpen(null);

  const runToggle = () =>
    toggle.mutate(category.id, {
      onSuccess: (reply) => {
        toast.success(reply.message ?? (ownOn ? "Category switched off" : "Category switched on"));
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
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${category.name}`} />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem
            disabled={!category.effectiveActive}
            onClick={() => setOpen("add")}
            className="items-start"
          >
            <FolderPlus className="mt-0.5" />
            <span className="flex flex-col">
              Add sub-category
              {!category.effectiveActive ? (
                <span className="text-xs text-muted-foreground">Switch it on first</span>
              ) : null}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen("rename")}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen("move")}>
            <FolderInput />
            Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {ownOn ? (
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

      {open === "add" ? (
        <CategoryNameDialog
          mode={{ kind: "add", parent: { id: category.id, name: category.name } }}
          open
          onOpenChange={(next) => !next && close()}
        />
      ) : null}
      {open === "rename" ? (
        <CategoryNameDialog
          mode={{ kind: "rename", category }}
          open
          onOpenChange={(next) => !next && close()}
        />
      ) : null}
      {open === "move" ? (
        <MoveCategoryDialog
          category={category}
          tree={tree}
          open
          onOpenChange={(next) => !next && close()}
        />
      ) : null}
      {open === "toggle" ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && close()}
          title={ownOn ? `Switch off ${category.name}?` : `Switch on ${category.name}?`}
          description={
            ownOn
              ? "Every sub-category below it goes off too. Their products disappear from the partner and field apps and can't be requested. New QR batches are still allowed, and old records stay as they are."
              : "Sub-categories below it come back on, unless they were switched off by themselves. If a category above it is still off, it stays off until that one is switched on."
          }
          confirmLabel={ownOn ? "Switch off" : "Switch on"}
          destructive={ownOn}
          pending={toggle.isPending}
          onConfirm={runToggle}
        />
      ) : null}
    </>
  );
}
