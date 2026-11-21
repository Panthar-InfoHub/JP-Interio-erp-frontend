"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

// A screen crashed: keep the menu and header, show a calm message and "Try again".
export default function ConsoleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-14 text-center shadow-sm">
      <TriangleAlert className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-semibold">Something went wrong on this screen</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try again. If it keeps happening, reload the page.
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
        <RefreshCw data-icon="inline-start" />
        Try again
      </Button>
    </div>
  );
}
