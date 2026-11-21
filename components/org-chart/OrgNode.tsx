import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface OrgNodeProps {
  /** Key for the open / closed state; leave out for a row with nothing under it. */
  nodeId?: string;
  isOpen?: boolean;
  onToggle?: (nodeId: string) => void;
  title: string;
  /** The person's staff page (DEC-261); leave out for a zone or an empty post. */
  href?: string;
  /** "Zonal Head", "ASM" … */
  role?: string;
  suspended?: boolean;
  /** Short counts, e.g. "3 SEs · 12 partners". */
  counts?: string;
  /** Extra labels such as "No Sales Executives". */
  badges?: ReactNode;
  /** Bigger text for the top level (a zone). */
  strong?: boolean;
  children?: ReactNode;
}

/**
 * One line of the folding org chart, with what sits under it. The arrow opens and closes
 * it; the name opens the person's staff page. Only open branches are drawn.
 */
export function OrgNode({
  nodeId,
  isOpen = false,
  onToggle,
  title,
  href,
  role,
  suspended = false,
  counts,
  badges,
  strong = false,
  children,
}: OrgNodeProps) {
  const canOpen = Boolean(nodeId && onToggle && children);

  return (
    <li>
      <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-1 py-1.5 hover:bg-muted/50">
        {canOpen ? (
          <button
            type="button"
            onClick={() => onToggle!(nodeId!)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Close" : "Open"} ${title}`}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ChevronRight
              className={cn("size-4 transition-transform", isOpen && "rotate-90")}
              aria-hidden
            />
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
        <span className={cn("min-w-0", strong ? "text-base font-semibold" : "text-sm")}>
          {href ? (
            <Link href={href} className="font-semibold text-primary hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </span>
        {role ? <span className="text-xs text-muted-foreground">{role}</span> : null}
        {suspended ? <StatusBadge tone="warning">Suspended</StatusBadge> : null}
        {badges}
        {counts ? (
          <span className="text-xs text-muted-foreground tabular-nums sm:ml-auto">{counts}</span>
        ) : null}
      </div>
      {canOpen && isOpen ? (
        <ul className="ml-4 border-l pl-2 sm:ml-5 sm:pl-3">{children}</ul>
      ) : null}
    </li>
  );
}
