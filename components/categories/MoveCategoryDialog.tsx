"use client";

import { Check, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

import { FormDialog } from "@/components/common/FormDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { useCategoryActions } from "@/hooks/catalog/useCategories";
import type { CategoryTreeNode } from "@/lib/api/catalog.api";
import { flattenCategoryPaths, selfAndBelowIds } from "@/lib/catalog/categoryTree";
import { errorMessage } from "@/lib/forms/serverErrors";
import { cn } from "@/lib/utils";

/** "Top level" in the picker (a real category id is a UUID, so this can't clash). */
const TOP = "top-level";

interface Choice {
  id: string;
  label: string;
  /** Why it can't be picked, or null. */
  blocked: "current" | "off" | null;
}

interface MoveCategoryDialogProps {
  category: CategoryTreeNode;
  tree: readonly CategoryTreeNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Move a category under another one, or to the top level (DEC-269): a searchable list of
 * full paths. Left out: the category itself and everything below it. Greyed: switched-off
 * categories (the server refuses them, DEC-112) and the current parent. Everything below
 * the category, and their products, move with it. Mounted only while open.
 */
export function MoveCategoryDialog({
  category,
  tree,
  open,
  onOpenChange,
}: MoveCategoryDialogProps) {
  const { update } = useCategoryActions();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [picked, setPicked] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const choices = useMemo<Choice[]>(() => {
    const excluded = selfAndBelowIds(category);
    const top: Choice = {
      id: TOP,
      label: "Top level",
      blocked: category.parentId === null ? "current" : null,
    };
    const rest = flattenCategoryPaths(tree)
      .filter((option) => !excluded.has(option.id))
      .map<Choice>((option) => ({
        id: option.id,
        label: option.path,
        blocked:
          option.id === category.parentId ? "current" : option.effectiveActive ? null : "off",
      }));
    return [top, ...rest];
  }, [category, tree]);

  const needle = deferredSearch.trim().toLowerCase();
  const shown = needle
    ? choices.filter((choice) => choice.label.toLowerCase().includes(needle))
    : choices;

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!picked) {
      setFormError("Choose where to move it.");
      return;
    }
    update.mutate(
      { id: category.id, changes: { parentId: picked === TOP ? null : picked } },
      {
        onSuccess: (reply) => {
          toast.success(reply.message ?? "Category moved");
          onOpenChange(false);
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Move ${category.name}`}
      description="Its sub-categories and all their products move with it."
      submitLabel="Move here"
      pending={update.isPending}
      onSubmit={save}
      formError={formError}
      size="md"
    >
      <div className="grid gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories"
            aria-label="Search categories"
            className="pl-8"
            maxLength={100}
          />
        </div>

        <ul
          role="listbox"
          aria-label="New parent"
          className="flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1"
        >
          {shown.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              No category matches.
            </li>
          ) : (
            shown.map((choice) => {
              const selected = picked === choice.id;
              const disabled = choice.blocked !== null;
              return (
                <li key={choice.id} role="option" aria-selected={selected} aria-disabled={disabled}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setPicked(choice.id);
                      setFormError(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                      "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                      selected ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted",
                      disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent",
                      choice.id === TOP && "font-semibold",
                    )}
                  >
                    <Check
                      className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 break-words">{choice.label}</span>
                    {choice.blocked === "current" ? (
                      <StatusBadge tone="neutral">Current place</StatusBadge>
                    ) : choice.blocked === "off" ? (
                      <StatusBadge tone="neutral">Off</StatusBadge>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <p className="text-xs text-muted-foreground">
          Switched-off categories can&apos;t take new sub-categories. Switch one on first to move
          here.
        </p>
      </div>
    </FormDialog>
  );
}
