"use client";

import { Hammer } from "lucide-react";
import { usePathname } from "next/navigation";

import { NoZoneMessage } from "@/components/common/NoZoneMessage";
import { NotFoundState } from "@/components/common/StateMessages";
import { PageHeader } from "@/components/layout/PageHeader";
import { findNavItem } from "@/config/navigation";
import { useNeedsZone } from "@/hooks/auth/useNeedsZone";
import { useCanAny } from "@/hooks/auth/usePermission";

/**
 * Any panel address without its own page yet. A menu item the person may use →
 * "coming soon"; anything else → "Not found" (same as an out-of-scope record).
 * A Zonal Head with no zone sees the "no zone" message on zone pages (DEC-238).
 */
export function SectionPlaceholder() {
  const pathname = usePathname();
  const item = findNavItem(pathname);
  const allowed = useCanAny(item?.anyOf ?? []);
  const needsZone = useNeedsZone();
  const exact = item?.href === pathname;

  if (!item || !allowed || !exact) return <NotFoundState />;

  return (
    <>
      <PageHeader title={item.label} />
      {needsZone && !item.zoneFree ? (
        <NoZoneMessage />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-14 text-center shadow-sm">
          <Hammer className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-semibold">Coming soon</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This screen is being built (plan area {item.area}).
          </p>
        </div>
      )}
    </>
  );
}
