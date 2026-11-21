"use client";

import { Eye, EyeOff } from "lucide-react";
import { useLayoutEffect, useState } from "react";

/**
 * A sensitive number (PAN, Aadhaar, GST, bank account, UPI) shown as "•••• 1234" with a
 * "Show" button (DEC-240). Only the screen is masked: the server sends the full number
 * to everyone allowed to see the partner (DEC-083). It hides again when the page is left.
 */
export function MaskedValue({ value, label }: { value: string | null | undefined; label: string }) {
  const [shown, setShown] = useState(false);

  // Next.js keeps visited pages alive; hide the number again when this page is left.
  useLayoutEffect(() => () => setShown(false), []);

  if (!value) return <span className="text-muted-foreground">—</span>;

  const masked = `•••• ${value.slice(-4)}`;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-mono tracking-wide break-all">{shown ? value : masked}</span>
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        aria-label={shown ? `Hide ${label}` : `Show full ${label}`}
        aria-pressed={shown}
        className="inline-flex items-center gap-1 rounded px-1 text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {shown ? (
          <EyeOff className="size-3.5" aria-hidden />
        ) : (
          <Eye className="size-3.5" aria-hidden />
        )}
        {shown ? "Hide" : "Show"}
      </button>
    </span>
  );
}
