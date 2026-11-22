"use client";

import { Check, Search, UserRound, X } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { ErrorState } from "@/components/common/StateMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PEOPLE_SEARCH_LIMIT,
  usePeopleSearch,
  type PeopleKind,
  type PersonOption,
} from "@/hooks/data/usePeopleSearch";
import { formatCount } from "@/lib/format/number";
import { HANDLER_ROLE_LABELS } from "@/lib/labels/request";
import { cn } from "@/lib/utils";

interface PersonFilterProps {
  kind: PeopleKind;
  /** The chosen person's id, or null for everyone. */
  value: string | null;
  /** What the button says while someone is chosen (their name when known). */
  valueLabel: string;
  onChange: (person: PersonOption | null) => void;
  /** Only people in this zone are offered (null = every zone I may see). */
  zoneId: string | null;
  /** The button's text with nobody chosen, e.g. "Any ASM team". */
  placeholder: string;
  className?: string;
}

function PeopleList({
  kind,
  zoneId,
  selectedId,
  onSelect,
}: {
  kind: PeopleKind;
  zoneId: string | null;
  selectedId: string | null;
  onSelect: (person: PersonOption) => void;
}) {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const people = usePeopleSearch(kind, deferred, zoneId);
  const items = people.data?.items ?? [];

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search a name"
          aria-label="Search a name"
          className="pl-8"
          maxLength={100}
          autoFocus
        />
      </div>
      <ul
        role="listbox"
        aria-label={kind === "asm" ? "ASMs" : "Handlers"}
        aria-busy={people.isFetching}
        className={cn(
          "flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1 transition-opacity",
          people.isFetching && people.data && "opacity-60",
        )}
      >
        {people.isPending ? (
          Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="p-2">
              <Skeleton className="h-4 w-3/4" />
            </li>
          ))
        ) : people.error && !people.data ? (
          <li>
            <ErrorState error={people.error} onRetry={() => void people.refetch()} />
          </li>
        ) : items.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nobody active matches.
          </li>
        ) : (
          items.map((person) => {
            const selected = person.id === selectedId;
            return (
              <li key={person.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onSelect(person)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted",
                  )}
                >
                  <Check
                    className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
                    aria-hidden
                  />
                  <span className="grid min-w-0 flex-1">
                    <span className="break-words">{person.name ?? "Unnamed"}</span>
                    <span className="text-xs text-muted-foreground">
                      {HANDLER_ROLE_LABELS[person.role]}
                      {person.zoneName ? ` · ${person.zoneName}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
      {(people.data?.total ?? 0) > PEOPLE_SEARCH_LIMIT ? (
        <p className="text-xs text-muted-foreground">
          Showing the first {PEOPLE_SEARCH_LIMIT} of {formatCount(people.data?.total)}. Type more of
          the name to narrow it down.
        </p>
      ) : null}
    </div>
  );
}

/**
 * A list filter that picks one ASM (or one handler: ASM or Sales Executive) by searching
 * names on the server (DEC-281). Active people only; limited to `zoneId` when set.
 */
export function PersonFilter({
  kind,
  value,
  valueLabel,
  onChange,
  zoneId,
  placeholder,
  className,
}: PersonFilterProps) {
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
          <UserRound data-icon="inline-start" />
          <span className="truncate">{value ? valueLabel : placeholder}</span>
        </PopoverTrigger>
        <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-2" align="start">
          {/* Mounted only while open, so each opening starts with an empty search. */}
          {open ? (
            <PeopleList
              kind={kind}
              zoneId={zoneId}
              selectedId={value}
              onSelect={(person) => {
                onChange(person);
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
          aria-label={`Clear ${placeholder.toLowerCase()}`}
          onClick={() => onChange(null)}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
