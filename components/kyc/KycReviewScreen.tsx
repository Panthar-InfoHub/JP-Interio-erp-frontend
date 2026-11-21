"use client";

import { ArrowLeft, Check, RotateCcw, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ReasonDialog } from "@/components/common/ReasonDialog";
import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { ApproveKycDialog } from "@/components/kyc/ApproveKycDialog";
import { PartnerAccountsTab } from "@/components/partners/detail/PartnerAccountsTab";
import { PartnerDetailsTab } from "@/components/partners/detail/PartnerDetailsTab";
import { PartnerHeader } from "@/components/partners/detail/PartnerHeader";
import { PartnerHistoryTab } from "@/components/partners/detail/PartnerHistoryTab";
import { PartnerKycTab } from "@/components/partners/detail/PartnerKycTab";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCan } from "@/hooks/auth/usePermission";
import { useKycActions, useKycDetail } from "@/hooks/kyc/useKyc";
import { isApiError } from "@/lib/api/errors";
import { errorMessage } from "@/lib/forms/serverErrors";
import { useAuthStore } from "@/stores/auth.store";

/** One-click reject reasons (DEC-244). Rejection is final, so none says "sign up again". */
const REJECT_REASONS = [
  "The PAN / Aadhaar photo is not clear.",
  "The name does not match the name on the documents.",
  "The PAN / Aadhaar / GST number does not match the document photo.",
  "The bank account / UPI ID is not in the partner's name.",
] as const;

type Dialog = "approve" | "reject" | "undo" | null;

function BackLink() {
  return (
    <Link
      href="/kyc"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      KYC review
    </Link>
  );
}

/**
 * Review one submitted partner (DEC-244): documents first, then details, accounts and
 * history. Approve / Reject in a bar that stays visible. Afterwards back to the queue;
 * after the Admin undoes a rejection, stay here (now pending) to check again.
 */
export function KycReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const can = useCan();
  const isAdmin = useAuthStore((state) => state.user?.role.key === "admin");
  const detail = useKycDetail(id);
  const actions = useKycActions(id);
  const [dialog, setDialog] = useState<Dialog>(null);

  if (detail.isPending) {
    return (
      <>
        <BackLink />
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </>
    );
  }

  if (detail.isError) {
    const notFound = isApiError(detail.error) && detail.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Partner not found" />
          ) : (
            <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
          )}
        </div>
      </>
    );
  }

  const partner = detail.data;
  const name = partner.basicInfo?.name ?? "this partner";
  const canDecide = can("kyc.verify") && partner.kycState === "pending";
  const canUndo = isAdmin && partner.kycState === "rejected";

  // A clash with another checker (409 KYC_WRONG_STATE): show the server's message and reload.
  const failed = (error: unknown) => {
    toast.error(errorMessage(error));
    if (isApiError(error) && error.code === "KYC_WRONG_STATE") {
      setDialog(null);
      void detail.refetch();
    }
  };

  const approve = (asmId: string | undefined) =>
    actions.approve.mutateAsync(asmId).then(
      () => {
        toast.success(`KYC approved for ${name}`);
        setDialog(null);
        router.push("/kyc");
      },
      (error: unknown) => {
        if (isApiError(error) && error.code === "KYC_WRONG_STATE") failed(error);
        throw error;
      },
    );

  const reject = (reason: string) =>
    actions.reject.mutate(reason, {
      onSuccess: () => {
        toast.success(`KYC rejected for ${name}`);
        setDialog(null);
        router.push("/kyc");
      },
      onError: failed,
    });

  const undo = (reason: string) =>
    actions.undoRejection.mutate(reason, {
      onSuccess: () => {
        toast.success("Rejection undone. The partner is back in the queue.");
        setDialog(null);
      },
      onError: failed,
    });

  return (
    <div>
      <BackLink />
      <PartnerHeader partner={partner} showActions={false} />

      {partner.kycState === "rejected" && partner.rejectionReason ? (
        <p className="mb-6 flex gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <strong>Rejected:</strong> {partner.rejectionReason}
          </span>
        </p>
      ) : null}

      <section
        className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
        aria-label="KYC documents"
      >
        <h2 className="mb-4 text-base">KYC documents</h2>
        <PartnerKycTab partner={partner} />
      </section>

      <Tabs defaultValue="details" className="gap-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="accounts">
              Payout accounts
              {partner.payoutAccounts.length > 0 ? ` (${partner.payoutAccounts.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <TabsContent value="details">
            <PartnerDetailsTab partner={partner} />
          </TabsContent>
          <TabsContent value="accounts">
            <PartnerAccountsTab partner={partner} />
          </TabsContent>
          <TabsContent value="history">
            <PartnerHistoryTab partner={partner} />
          </TabsContent>
        </div>
      </Tabs>

      {canDecide || canUndo ? (
        // Sticky at the bottom of the page content: always visible while scrolling,
        // never over the sidebar (whatever its width).
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t bg-background/95 backdrop-blur sm:-mx-6">
          <div className="flex w-full flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6">
            {canDecide ? (
              <>
                <p className="mr-auto hidden text-sm text-muted-foreground sm:block">
                  Checked the documents?
                </p>
                <Button variant="destructive" onClick={() => setDialog("reject")}>
                  <X data-icon="inline-start" />
                  Reject
                </Button>
                <Button onClick={() => setDialog("approve")}>
                  <Check data-icon="inline-start" />
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setDialog("undo")}>
                <RotateCcw data-icon="inline-start" />
                Undo rejection
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {dialog === "approve" ? (
        <ApproveKycDialog
          partner={partner}
          open
          onOpenChange={(next) => !next && setDialog(null)}
          pending={actions.approve.isPending}
          onApprove={approve}
        />
      ) : null}

      <ReasonDialog
        open={dialog === "reject"}
        onOpenChange={(next) => !next && setDialog(null)}
        title={`Reject KYC for ${name}?`}
        description="Rejection is final: the partner can't apply again, and their numbers stay blocked. The reason is shown to the partner in their app."
        label="Reason (shown to the partner)"
        minLength={3}
        maxLength={1000}
        suggestions={REJECT_REASONS}
        confirmLabel="Reject"
        destructive
        pending={actions.reject.isPending}
        onConfirm={reject}
      />

      <ReasonDialog
        open={dialog === "undo"}
        onOpenChange={(next) => !next && setDialog(null)}
        title="Undo this rejection?"
        description="The partner goes back to Pending to be checked again. They are not approved yet."
        label="Why undo it?"
        minLength={3}
        maxLength={1000}
        confirmLabel="Undo rejection"
        pending={actions.undoRejection.isPending}
        onConfirm={undo}
      />
    </div>
  );
}
