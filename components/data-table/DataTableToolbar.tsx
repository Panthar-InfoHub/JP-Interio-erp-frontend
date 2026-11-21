import { FilterX } from "lucide-react";
import type { ReactNode } from "react";

import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";

interface DataTableToolbarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  /** The list's own filters (ZonePicker, DateRangePicker, status Select …). */
  children?: ReactNode;
  isFiltered: boolean;
  onClear: () => void;
}

/** Search + filters above a list; stacks on phones. */
export function DataTableToolbar({ search, children, isFiltered, onClear }: DataTableToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {search ? (
        <SearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          className="sm:w-72"
        />
      ) : null}
      {children}
      {isFiltered ? (
        <Button variant="ghost" onClick={() => onClear()} className="self-start sm:self-auto">
          <FilterX data-icon="inline-start" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
