"use client";

import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import { CategoryNameDialog } from "@/components/categories/CategoryNameDialog";
import { CategoryTreeItem } from "@/components/categories/CategoryTreeItem";
import { EmptyState, ErrorState } from "@/components/common/StateMessages";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryTree } from "@/hooks/catalog/useCategories";
import { branchIds } from "@/lib/catalog/categoryTree";

function TreeSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Loading categories">
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-8 w-full max-w-xl" />
      ))}
    </div>
  );
}

/**
 * Categories (Admin, Products & Catalog Sub-Admin, `products.manage`, DEC-267, DEC-269):
 * the whole tree as a folding list, with on / off badges and product counts. Each line's
 * "…" menu adds a sub-category, renames, moves and switches off / on. Opens with only the
 * top level showing.
 */
export function CategoriesScreen() {
  const tree = useCategoryTree();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [adding, setAdding] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpen(next);
  };

  const data = tree.data;
  const hasBranches = data ? branchIds(data).length > 0 : false;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Products sit on one category, at any level, and count under every category above it. A category that is off hides everything below it from the apps."
        actions={
          <>
            {hasBranches && data ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(new Set(branchIds(data)))}
                >
                  <ChevronsUpDown data-icon="inline-start" />
                  Open all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setOpen(new Set())}>
                  <ChevronsDownUp data-icon="inline-start" />
                  Close all
                </Button>
              </>
            ) : null}
            <Button onClick={() => setAdding(true)}>
              <Plus data-icon="inline-start" />
              Add category
            </Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
        {!data && !tree.isError ? (
          <TreeSkeleton />
        ) : !data ? (
          <ErrorState error={tree.error} onRetry={() => void tree.refetch()} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Add a top-level category such as Plywood, then sub-categories under it."
          />
        ) : (
          <ul aria-label="Categories">
            {data.map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                tree={data}
                open={open}
                onToggle={toggle}
                strong
              />
            ))}
          </ul>
        )}
      </div>

      {adding ? (
        <CategoryNameDialog
          mode={{ kind: "add", parent: null }}
          open
          onOpenChange={(next) => !next && setAdding(false)}
        />
      ) : null}
    </>
  );
}
