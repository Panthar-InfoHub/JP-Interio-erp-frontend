"use client";

import { Ban, CircleCheck, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ReasonDialog } from "@/components/common/ReasonDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTicketActions } from "@/hooks/tickets/useTickets";
import type { Ticket } from "@/lib/api/tickets.api";
import { errorMessage } from "@/lib/forms/serverErrors";

/** Same limits as the server (DEC-188). */
const NOTE_MIN = 10;
const NOTE_MAX = 2000;

type Closing = "resolved" | "rejected";

/**
 * The Admin's moves on a ticket (DEC-188, DEC-296): open → "Start working" (at once, no
 * note), "Resolve", "Reject"; in progress → "Resolve", "Reject"; resolved / rejected are
 * final (no buttons). Resolve / Reject ask for a note the partner will see. The page stays
 * and refreshes afterwards.
 */
export function TicketActions({ ticket }: { ticket: Ticket }) {
  const { changeStatus } = useTicketActions();
  // Which close was chosen stays set while the pop-up fades out, so its words don't flip.
  const [closing, setClosing] = useState<Closing>("resolved");
  const [noteOpen, setNoteOpen] = useState(false);
  const openNote = (kind: Closing) => {
    setClosing(kind);
    setNoteOpen(true);
  };
  const isOpen = ticket.status === "open";
  const isUnfinished = isOpen || ticket.status === "in_progress";
  if (!isUnfinished) return null;

  const start = () =>
    changeStatus.mutate(
      { id: ticket.id, input: { status: "in_progress" } },
      {
        onSuccess: (reply) => toast.success(reply.message ?? "Ticket marked in progress"),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );

  const close = (status: "resolved" | "rejected", note: string) =>
    changeStatus.mutate(
      { id: ticket.id, input: { status, note } },
      {
        onSuccess: (reply) => {
          toast.success(
            reply.message ?? (status === "resolved" ? "Ticket resolved" : "Ticket rejected"),
          );
          setNoteOpen(false);
        },
        onError: (error) => {
          toast.error(errorMessage(error));
          setNoteOpen(false);
        },
      },
    );

  const starting = changeStatus.isPending && !noteOpen;

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {isOpen ? (
        <Button variant="outline" disabled={changeStatus.isPending} onClick={start}>
          {starting ? <Spinner data-icon="inline-start" /> : <Play data-icon="inline-start" />}
          Start working
        </Button>
      ) : null}
      <Button disabled={changeStatus.isPending} onClick={() => openNote("resolved")}>
        <CircleCheck data-icon="inline-start" />
        Resolve
      </Button>
      <Button
        variant="destructive"
        disabled={changeStatus.isPending}
        onClick={() => openNote("rejected")}
      >
        <Ban data-icon="inline-start" />
        Reject
      </Button>

      <ReasonDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        title={
          closing === "rejected" ? `Reject ${ticket.ticketNo}?` : `Resolve ${ticket.ticketNo}?`
        }
        description={
          closing === "rejected"
            ? "Say why. The partner sees this note. A rejected ticket can't be changed or reopened."
            : "Say what was done. The partner sees this note. A resolved ticket can't be changed or reopened."
        }
        label="Note for the partner"
        minLength={NOTE_MIN}
        maxLength={NOTE_MAX}
        confirmLabel={closing === "rejected" ? "Reject ticket" : "Resolve ticket"}
        destructive={closing === "rejected"}
        pending={changeStatus.isPending}
        onConfirm={(note) => close(closing, note)}
      />
    </div>
  );
}
