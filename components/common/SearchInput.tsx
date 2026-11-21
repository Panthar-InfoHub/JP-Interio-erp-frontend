"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  /** Called 350 ms after the person stops typing (not on every key). */
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Search box that waits for a short pause before searching, so typing is cheap. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const timer = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // The address changed from outside (back button, "clear filters"): show it.
  // (Adjusting state while rendering, as React advises, instead of an effect.)
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const update = (next: string) => {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChangeRef.current(next.trim()), 350);
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pr-8 pl-8"
        maxLength={100}
      />
      {text ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.clearTimeout(timer.current);
            setText("");
            onChange("");
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
