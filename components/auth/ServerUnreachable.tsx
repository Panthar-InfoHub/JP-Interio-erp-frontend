import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The server could not be reached while checking the session. */
export function ServerUnreachable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-sm">
        <WifiOff className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h1 className="mt-3 text-lg">Can&apos;t reach the server</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your internet connection, then try again.
        </p>
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
      </div>
    </div>
  );
}
