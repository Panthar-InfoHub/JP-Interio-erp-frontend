"use client";

import { Landmark, Pencil, Plus, Smartphone, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MaskedValue } from "@/components/common/MaskedValue";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PayoutAccountDialog } from "@/components/partners/actions/PayoutAccountDialog";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/auth/usePermission";
import { usePartnerActions } from "@/hooks/partners/usePartnerActions";
import { errorMessage } from "@/lib/forms/serverErrors";
import type { Partner360, PayoutAccount } from "@/types/partner";

/**
 * Bank accounts and UPI IDs the partner is paid to (DEC-101, DEC-102). With
 * `partners.payout_accounts` and a verified, not deactivated partner: add, edit, make
 * default, remove (never the last one; removing the default makes the oldest the new default).
 */
export function PartnerAccountsTab({ partner }: { partner: Partner360 }) {
  const can = useCan();
  const actions = usePartnerActions(partner.partnerId);
  const [editing, setEditing] = useState<PayoutAccount | "new" | null>(null);
  const [removing, setRemoving] = useState<PayoutAccount | null>(null);

  const canManage =
    can("partners.payout_accounts") &&
    partner.kycState === "verified" &&
    partner.accountStatus !== "deactivated";
  const accounts = partner.payoutAccounts;
  const onlyOne = accounts.length <= 1;

  const makeDefault = (account: PayoutAccount) =>
    actions.setDefaultAccount.mutate(account.id, {
      onSuccess: () => toast.success("Default account changed"),
      onError: (error) => toast.error(errorMessage(error)),
    });

  const remove = () => {
    if (!removing) return;
    actions.removeAccount.mutate(removing.id, {
      onSuccess: () => {
        toast.success("Account removed");
        setRemoving(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error));
        setRemoving(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <Button className="self-start" onClick={() => setEditing("new")}>
          <Plus data-icon="inline-start" />
          Add bank account or UPI ID
        </Button>
      ) : null}

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bank account or UPI ID yet.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => {
            const isBank = account.method === "bank";
            const Icon = isBank ? Landmark : Smartphone;
            return (
              <li key={account.id} className="flex flex-col gap-3 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold">
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {isBank ? (account.bankName ?? "Bank account") : "UPI ID"}
                  </p>
                  {account.isDefault ? <StatusBadge tone="success">Default</StatusBadge> : null}
                </div>
                <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Holder</dt>
                  <dd>{account.holderName ?? "—"}</dd>
                  {isBank ? (
                    <>
                      <dt className="text-muted-foreground">Account no.</dt>
                      <dd>
                        <MaskedValue value={account.accountNumber} label="account number" />
                      </dd>
                      <dt className="text-muted-foreground">IFSC</dt>
                      <dd className="font-mono">{account.ifsc ?? "—"}</dd>
                    </>
                  ) : (
                    <>
                      <dt className="text-muted-foreground">UPI ID</dt>
                      <dd>
                        <MaskedValue value={account.upiId} label="UPI ID" />
                      </dd>
                    </>
                  )}
                </dl>
                {canManage ? (
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditing(account)}>
                      <Pencil data-icon="inline-start" />
                      Edit
                    </Button>
                    {account.isDefault ? null : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actions.setDefaultAccount.isPending}
                        onClick={() => makeDefault(account)}
                      >
                        <Star data-icon="inline-start" />
                        Make default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={onlyOne}
                      title={onlyOne ? "The partner needs at least one account" : undefined}
                      onClick={() => setRemoving(account)}
                    >
                      <Trash2 data-icon="inline-start" />
                      Remove
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canManage && onlyOne && accounts.length === 1 ? (
        <p className="text-xs text-muted-foreground">
          The last account can&apos;t be removed. Add another one first.
        </p>
      ) : null}

      {editing ? (
        <PayoutAccountDialog
          partnerId={partner.partnerId}
          account={editing === "new" ? null : editing}
          open
          onOpenChange={(next) => !next && setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => !next && setRemoving(null)}
        title="Remove this account?"
        description={
          removing?.isDefault
            ? "This is the default account. The oldest remaining account becomes the default. The removed account stays in the history and its number stays blocked for other partners."
            : "The account stays in the history and its number stays blocked for other partners."
        }
        confirmLabel="Remove account"
        destructive
        pending={actions.removeAccount.isPending}
        onConfirm={remove}
      />
    </div>
  );
}
