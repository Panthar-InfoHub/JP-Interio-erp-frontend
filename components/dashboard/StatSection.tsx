import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A titled group of dashboard cards: 2 per row on phones, up to 4 on wide screens. */
export function StatSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)} aria-label={title}>
      <div>
        <h2 className="text-base">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}
