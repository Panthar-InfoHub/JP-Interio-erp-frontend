"use client";

import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fromDayString, toDayString, todayInIndia } from "@/lib/format/istDay";
import { cn } from "@/lib/utils";

interface DayPickerProps {
  /** "YYYY-MM-DD" (an India day), or null. */
  value: string | null;
  onChange: (day: string | null) => void;
  /** Shown when no day is picked. */
  placeholder: string;
  className?: string;
}

/** Pick one past or present day (e.g. "as at the end of this day"). Future days are off. */
export function DayPicker({ value, onChange, placeholder, className }: DayPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromDayString(value) : undefined;
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
                !selected && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarDays data-icon="inline-start" />
          <span className="truncate">
            {selected ? format(selected, "d MMM yyyy") : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            disabled={today ? { after: today } : undefined}
            onSelect={(day) => {
              onChange(day ? toDayString(day) : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {selected ? (
        <Button variant="ghost" size="icon" aria-label="Back to now" onClick={() => onChange(null)}>
          <X />
        </Button>
      ) : null}
    </div>
  );
}
