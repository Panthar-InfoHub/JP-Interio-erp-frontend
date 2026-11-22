"use client";

import { Package, X } from "lucide-react";
import { useState } from "react";

import { QrProductSearchList } from "@/components/qr-batches/QrProductSearchList";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { QrPickerProduct } from "@/lib/api/qr.api";
import { cn } from "@/lib/utils";

interface QrProductFilterProps {
  /** The filtered product's id, or null for every product. */
  value: string | null;
  /** What the button says while a product is chosen (its name and SKU when known). */
  valueLabel: string;
  onChange: (product: QrPickerProduct | null) => void;
  className?: string;
}

/**
 * The batch list's product filter (DEC-275): a pop-over with a server search of the
 * switched-on products. A switched-off product can still be the filter, set from a row's
 * product link.
 */
export function QrProductFilter({ value, valueLabel, onChange, className }: QrProductFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "min-w-0 flex-1 justify-start font-normal",
                !value && "text-muted-foreground",
              )}
            />
          }
        >
          <Package data-icon="inline-start" />
          <span className="truncate">{value ? valueLabel : "All products"}</span>
        </PopoverTrigger>
        <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-2" align="start">
          {/* Mounted only while open, so each opening starts with an empty search. */}
          {open ? (
            <QrProductSearchList
              selectedId={value}
              autoFocus
              listClassName="max-h-80"
              onSelect={(product) => {
                onChange(product);
                setOpen(false);
              }}
            />
          ) : null}
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Clear product filter"
          onClick={() => onChange(null)}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
