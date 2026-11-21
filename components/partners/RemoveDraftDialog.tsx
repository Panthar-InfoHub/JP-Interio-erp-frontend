"use client";

import { toast } from "sonner";

import { ReasonDialog } from "@/components/common/ReasonDialog";
import { useRemoveDraft } from "@/hooks/partners/useDrafts";
import { errorMessage } from "@/lib/forms/serverErrors";

interface RemoveDraftDialogProps {
  partnerId: string;
  /** Shown in the title, e.g. the partner's name or phone. */
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** After a successful removal (e.g. look the number up again, or leave the page). */
  onRemoved: () => void;
}

/**
 * "Remove this draft" (Admin, DEC-096, DEC-247): an unfinished sign-up is retired now,
 * like the daily clean-up. Reason 3 – 500 characters, saved in the audit log.
 */
export function RemoveDraftDialog({
  partnerId,
  label,
  open,
  onOpenChange,
  onRemoved,
}: RemoveDraftDialogProps) {
  const remove = useRemoveDraft();

  return (
    <ReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Remove the unfinished sign-up of ${label}?`}
      description="The account is switched off, its phone and every number it holds (PAN, Aadhaar, GST, bank, UPI) become free, and its photos are deleted. The person can sign up again. This can't be undone."
      label="Reason (saved in the audit log)"
      minLength={3}
      maxLength={500}
      confirmLabel="Remove draft"
      destructive
      pending={remove.isPending}
      onConfirm={(reason) =>
        remove.mutate(
          { partnerId, reason },
          {
            onSuccess: (reply) => {
              toast.success(
                reply.message ?? "Draft removed. Its phone and numbers are free again.",
              );
              onOpenChange(false);
              onRemoved();
            },
            onError: (error) => toast.error(errorMessage(error)),
          },
        )
      }
    />
  );
}
