import { BrandMark } from "@/components/brand/BrandMark";
import { Spinner } from "@/components/ui/spinner";

/** Shown for the moment the panel checks the session on page load. */
export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 p-4">
      <BrandMark className="text-xl" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Spinner />
        {label}
      </div>
    </div>
  );
}
