import { MapPinOff } from "lucide-react";

/** A Zonal Head who has no zone yet: every zone page shows this (DEC-238). */
export function NoZoneMessage() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-14 text-center shadow-sm">
      <MapPinOff className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-semibold">You aren&apos;t assigned to a zone yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Please ask the Admin to assign you one. Your zone&apos;s partners, payouts, tasks and
        reports will show here after that.
      </p>
    </div>
  );
}
