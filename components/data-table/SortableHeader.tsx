import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** "name" → "-name" → "name" …; another column starts with its `firstSort`. */
export function nextSort(current: string, field: string, firstSort: "asc" | "desc"): string {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return field;
  return firstSort === "desc" ? `-${field}` : field;
}

export function sortDirection(current: string, field: string): "asc" | "desc" | null {
  if (current === field) return "asc";
  if (current === `-${field}`) return "desc";
  return null;
}

/** A column header that sorts the list on the server when clicked. */
export function SortableHeader({
  children,
  direction,
  align = "start",
  onClick,
}: {
  children: ReactNode;
  direction: "asc" | "desc" | null;
  align?: "start" | "end";
  onClick: () => void;
}) {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        align === "end" && "flex-row-reverse",
        direction ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
      <Icon className={cn("size-3.5", !direction && "opacity-50")} aria-hidden />
    </button>
  );
}
