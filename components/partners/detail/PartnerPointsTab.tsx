"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { AdjustPointsDialog } from "@/components/ledger/AdjustPointsDialog";
import { PartnerStatementTab } from "@/components/ledger/partner/PartnerStatementTab";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import type { Partner360 } from "@/types/partner";

/**
 * Partner 360 "Points" tab (DEC-258): the points statement with its filters and, with
 * `ledger.adjust`, the Adjust points button. The wallet itself is in the summary boxes
 * at the top. Shown only when the server sends the points box (`ledger.view`).
 */
export function PartnerPointsTab({ partner }: { partner: Partner360 }) {
  const can = useCan();
  const [adjusting, setAdjusting] = useState(false);
  const wallet = partner.points?.wallet ?? null;
  const name = partner.basicInfo?.name ?? "this partner";
  const blocked = !wallet
    ? (partner.points?.note ?? "No wallet yet: the partner isn't verified.")
    : wallet.frozen
      ? "The wallet is frozen: no points can move."
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      {can("ledger.adjust") ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={Boolean(blocked)} title={blocked} onClick={() => setAdjusting(true)}>
            <SlidersHorizontal data-icon="inline-start" />
            Adjust points
          </Button>
          {blocked ? <p className="text-sm text-muted-foreground">{blocked}</p> : null}
        </div>
      ) : null}

      <div>
        <PartnerStatementTab partnerId={partner.partnerId} />
      </div>

      {adjusting && wallet ? (
        <AdjustPointsDialog
          partnerId={partner.partnerId}
          partnerName={name}
          available={wallet.available}
          open
          onOpenChange={(next) => !next && setAdjusting(false)}
        />
      ) : null}
    </div>
  );
}
