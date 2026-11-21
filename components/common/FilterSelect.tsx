"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

interface FilterSelectProps {
  /** Shown to screen readers, e.g. "Partner type". */
  label: string;
  /** The selected value, or null for "all". */
  value: string | null;
  onChange: (value: string | null) => void;
  /** value → label, in the order to show. */
  options: Record<string, string>;
  /** Label of the "no filter" choice, e.g. "All types". */
  allLabel: string;
  disabled?: boolean;
  className?: string;
}

/** A list filter drop-down with an "All …" choice (= no filter). */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  disabled,
  className = "sm:w-44",
}: FilterSelectProps) {
  const items: Record<string, string> = { [ALL]: allLabel, ...options };
  return (
    <Select
      value={value ?? ALL}
      items={items}
      disabled={disabled}
      onValueChange={(next) => onChange(!next || next === ALL ? null : String(next))}
    >
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {optionLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
