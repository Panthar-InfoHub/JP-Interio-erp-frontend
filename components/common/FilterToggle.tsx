"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterToggleProps {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  className?: string;
}

/** An on / off list filter shown as a button, e.g. "Overdue only" (DEC-287). */
export function FilterToggle({ label, pressed, onPressedChange, className }: FilterToggleProps) {
  return (
    <Button
      variant="outline"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "font-normal",
        pressed && "border-primary bg-primary/10 font-semibold text-primary hover:bg-primary/15",
        className,
      )}
    >
      {pressed ? <Check data-icon="inline-start" /> : null}
      {label}
    </Button>
  );
}
