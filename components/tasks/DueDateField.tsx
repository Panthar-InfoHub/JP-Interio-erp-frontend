"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, fromDayString, toDayString, todayInIndia } from "@/lib/format/istDay";
import { cn } from "@/lib/utils";

const QUICK: { label: string; days: number }[] = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In a week", days: 7 },
];

interface DueDateFieldProps {
  id?: string;
  /** "YYYY-MM-DD" (an India day), or "" for none. */
  value: string;
  onChange: (day: string) => void;
  invalid?: boolean;
}

/**
 * A task's due day (DEC-291): today (India) or later, from a calendar or the quick buttons
 * Today / Tomorrow / In a week. A current day already in the past (editing an overdue task)
 * still shows; only a new day must be today or later.
 */
export function DueDateField({ id, value, onChange, invalid }: DueDateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromDayString(value) : undefined;
  const today = fromDayString(todayInIndia());

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              aria-invalid={invalid || undefined}
              className={cn(
                "w-full justify-start font-normal",
                !selected && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarDays data-icon="inline-start" />
          {selected ? format(selected, "EEE, d MMM yyyy") : "Pick a day"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            disabled={today ? { before: today } : undefined}
            onSelect={(day) => {
              if (day) onChange(toDayString(day));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {QUICK.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="outline"
            size="sm"
            // The clock is read on the tap, not while drawing.
            onClick={() => onChange(addDays(todayInIndia(), item.days))}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
