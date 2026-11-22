"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * A small icon button that copies a text (e.g. a QR link) to the clipboard. Shows a tick
 * for a moment; doesn't open the table row it sits in.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          () => toast.error("Couldn't copy. Your browser blocked the clipboard."),
        );
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  );
}
