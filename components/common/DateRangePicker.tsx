"use client";

import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fromDayString, toDayString, todayInIndia } from "@/lib/format/istDay";
import { cn } from "@/lib/utils";

/** Calendar days as "YYYY-MM-DD" (India days); both ends included. */
export interface DayRange {
  from: string | null;
  to: string | null;
}

interface DateRangePickerProps {
  value: DayRange;
  onChange: (range: DayRange) => void;
  placeholder?: string;
  /** Let future days be picked too (e.g. due dates). Default: up to today only. */
  allowFuture?: boolean;
  className?: string;
}

function label(range: DayRange, placeholder: string): string {
  const from = range.from ? fromDayString(range.from) : undefined;
  const to = range.to ? fromDayString(range.to) : undefined;
  if (from && to) return `${format(from, "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`;
  if (from) return `From ${format(from, "d MMM yyyy")}`;
  if (to) return `Until ${format(to, "d MMM yyyy")}`;
  return placeholder;
}

/**
 * Pick a range of days for a filter. Gives plain days; list API calls turn them into
 * India-time moments with `istDayStart` / `istDayEnd` (lib/format/istDay.ts).
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Any date",
  allowFuture = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const selected: DateRange | undefined =
    value.from || value.to
      ? {
          from: value.from ? fromDayString(value.from) : undefined,
          to: value.to ? fromDayString(value.to) : undefined,
        }
      : undefined;
  const hasValue = Boolean(value.from || value.to);
  const today = fromDayString(todayInIndia());

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "min-w-0 flex-1 justify-start font-normal",
                !hasValue && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarDays data-icon="inline-start" />
          <span className="truncate">{label(value, placeholder)}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={selected}
            defaultMonth={selected?.from ?? today}
            disabled={today && !allowFuture ? { after: today } : undefined}
            onSelect={(range) =>
              onChange({
                from: range?.from ? toDayString(range.from) : null,
                to: range?.to ? toDayString(range.to) : null,
              })
            }
          />
        </PopoverContent>
      </Popover>
      {hasValue ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Clear dates"
          onClick={() => onChange({ from: null, to: null })}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
