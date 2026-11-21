"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useZoneOptions } from "@/hooks/data/useZoneOptions";
import { useAuthStore } from "@/stores/auth.store";

const ALL = "all";

interface ZonePickerProps {
  /** Zone id, or null for "All zones". */
  value: string | null;
  onChange: (zoneId: string | null) => void;
  /** Label of the "no filter" choice. */
  allLabel?: string;
  className?: string;
  id?: string;
}

/**
 * Zone filter. A Zonal Head only ever works in their own zone, so for them it shows
 * that zone and cannot be changed (the server forces it anyway).
 */
export function ZonePicker({
  value,
  onChange,
  allLabel = "All zones",
  className,
  id,
}: ZonePickerProps) {
  const user = useAuthStore((state) => state.user);
  const ownZone = user?.role.key === "zonal_head" ? user.zone : null;
  const zones = useZoneOptions(!ownZone);

  if (ownZone) {
    return (
      <Select value={ownZone.id} items={{ [ownZone.id]: ownZone.name }} disabled>
        <SelectTrigger id={id} className={className} aria-label="Zone">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
  }

  const items: Record<string, string> = { [ALL]: allLabel };
  for (const zone of zones.data ?? []) items[zone.id] = zone.name;

  return (
    <Select
      value={value ?? ALL}
      items={items}
      onValueChange={(next) => onChange(!next || next === ALL ? null : String(next))}
    >
      <SelectTrigger id={id} className={className} aria-label="Zone">
        <SelectValue placeholder={zones.isPending ? "Loading zones…" : allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {(zones.data ?? []).map((zone) => (
          <SelectItem key={zone.id} value={zone.id}>
            {zone.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
