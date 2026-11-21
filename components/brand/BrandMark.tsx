import { cn } from "@/lib/utils";

/** Text logo until a logo file arrives (DEC-230). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 font-semibold", className)}>
      <span className="text-primary">JP Interio</span>
      <span className="text-xs font-normal text-muted-foreground">Admin</span>
    </span>
  );
}
