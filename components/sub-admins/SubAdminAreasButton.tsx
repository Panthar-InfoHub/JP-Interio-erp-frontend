"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { EditAreasDialog } from "@/components/sub-admins/EditAreasDialog";
import { Button } from "@/components/ui/button";
import type { SubAdmin } from "@/lib/api/subAdmins.api";

/**
 * "Edit areas" on a Sub-Admins list row (DEC-302). A click or Enter here, or inside the
 * pop-up (React bubbles through this element), must not reach the row, which opens the
 * staff page.
 */
export function SubAdminAreasButton({ subAdmin }: { subAdmin: SubAdmin }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="flex justify-end"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ShieldCheck data-icon="inline-start" />
        Edit areas
      </Button>
      {open ? (
        <EditAreasDialog
          subAdmin={subAdmin}
          open
          onOpenChange={(next) => !next && setOpen(false)}
        />
      ) : null}
    </div>
  );
}
