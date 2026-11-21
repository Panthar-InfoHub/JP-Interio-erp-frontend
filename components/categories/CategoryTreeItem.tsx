import Link from "next/link";

import { CategoryRowActions } from "@/components/categories/CategoryRowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { OrgNode } from "@/components/org-chart/OrgNode";
import type { CategoryTreeNode } from "@/lib/api/catalog.api";

interface CategoryTreeItemProps {
  category: CategoryTreeNode;
  tree: readonly CategoryTreeNode[];
  open: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** Top-level line: bigger text. */
  strong?: boolean;
}

/** Why a category is off: its own switch, or a category above it (DEC-110). */
function OffBadge({ category }: { category: CategoryTreeNode }) {
  if (!category.active) return <StatusBadge tone="neutral">Off</StatusBadge>;
  if (!category.effectiveActive) {
    return (
      <StatusBadge tone="neutral">
        Off:{" "}
        {category.offBecauseOf
          ? `"${category.offBecauseOf.name}" is off`
          : "a category above is off"}
      </StatusBadge>
    );
  }
  return null;
}

/** "12 products · 10 on" (itself and everything below), linked to Products (DEC-269). */
function ProductCount({ category }: { category: CategoryTreeNode }) {
  const counts = category.productCounts.includingBelow;
  if (counts.total === 0) return <>No products</>;
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="whitespace-nowrap hover:underline"
      title="Open the products in this category and below"
    >
      <span className="font-semibold text-foreground">{counts.total}</span>{" "}
      {counts.total === 1 ? "product" : "products"} ·{" "}
      <span className="font-semibold text-foreground">{counts.active}</span> on
    </Link>
  );
}

/**
 * One category line in the folding tree, with its sub-categories under it (only open
 * branches are drawn). Switched-off lines carry an "Off" badge saying why.
 */
export function CategoryTreeItem({
  category,
  tree,
  open,
  onToggle,
  strong = false,
}: CategoryTreeItemProps) {
  const hasChildren = category.children.length > 0;

  return (
    <OrgNode
      nodeId={hasChildren ? category.id : undefined}
      isOpen={open.has(category.id)}
      onToggle={onToggle}
      title={category.name}
      strong={strong}
      badges={<OffBadge category={category} />}
      counts={<ProductCount category={category} />}
      actions={<CategoryRowActions category={category} tree={tree} />}
    >
      {hasChildren
        ? category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              tree={tree}
              open={open}
              onToggle={onToggle}
            />
          ))
        : null}
    </OrgNode>
  );
}
