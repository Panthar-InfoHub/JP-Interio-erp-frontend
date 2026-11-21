import type { CategoryTreeNode } from "@/lib/api/catalog.api";

/** One category as a line in a picker: its full path and whether it can hold new things. */
export interface CategoryPathOption {
  id: string;
  /** "Plywood › Marine › BWR" */
  path: string;
  effectiveActive: boolean;
}

export const PATH_SEPARATOR = " › ";

/** Any nested category list: the staff tree, or the app catalog's (all on, no switch field). */
interface PathNode {
  id: string;
  name: string;
  effectiveActive?: boolean;
  children: readonly PathNode[];
}

/** Every category, top-down in tree order, as full paths (move picker, filters, pickers). */
export function flattenCategoryPaths(tree: readonly PathNode[]): CategoryPathOption[] {
  const out: CategoryPathOption[] = [];
  const walk = (nodes: readonly PathNode[], above: string[]) => {
    for (const node of nodes) {
      const names = [...above, node.name];
      out.push({
        id: node.id,
        path: names.join(PATH_SEPARATOR),
        effectiveActive: node.effectiveActive ?? true,
      });
      walk(node.children, names);
    }
  };
  walk(tree, []);
  return out;
}

/** The ids of a category and everything below it (a category can't move under these). */
export function selfAndBelowIds(node: CategoryTreeNode): Set<string> {
  const ids = new Set<string>();
  const walk = (current: CategoryTreeNode) => {
    ids.add(current.id);
    current.children.forEach(walk);
  };
  walk(node);
  return ids;
}

/** Every category that has sub-categories (what "Open all" opens). */
export function branchIds(tree: readonly CategoryTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (nodes: readonly CategoryTreeNode[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) ids.push(node.id);
      walk(node.children);
    }
  };
  walk(tree);
  return ids;
}
