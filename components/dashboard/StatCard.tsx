import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small line under the number (₹ amount, "now", a short explanation). */
  hint?: ReactNode;
  /** Draw attention (e.g. overdue tasks, payouts waiting) when the number is above 0. */
  attention?: boolean;
  /** Opens the matching list — only once that list exists (DEC-236). */
  href?: string;
}

/** One number on the dashboard. */
export function StatCard({ label, value, hint, attention = false, href }: StatCardProps) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
          attention && "text-warning",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{hint}</p> : null}
    </>
  );

  const className = "rounded-xl border bg-card p-4 shadow-sm";
  return href ? (
    <Link
      href={href}
      className={cn(
        className,
        "block transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
