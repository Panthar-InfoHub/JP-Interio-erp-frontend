"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState, NotFoundState } from "@/components/common/StateMessages";
import { StaffDetailsCard } from "@/components/staff/detail/StaffDetailsCard";
import { StaffHeader } from "@/components/staff/detail/StaffHeader";
import { StaffSummary } from "@/components/staff/detail/StaffSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffMember } from "@/hooks/staff/useStaff";
import { isApiError } from "@/lib/api/errors";

function BackLink() {
  return (
    <Link
      href="/staff"
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Staff
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading the staff member">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}

/**
 * Staff details (`users.view`, DEC-261): header, team and task numbers, then the details.
 * Someone out of view comes back as 404 from the server (R2) and shows "not found".
 * The actions (edit, switch off / on, move) come in F6 T3.
 */
export function StaffDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const member = useStaffMember(id);

  if (member.isPending) {
    return (
      <>
        <BackLink />
        <DetailSkeleton />
      </>
    );
  }

  if (member.isError) {
    const notFound = isApiError(member.error) && member.error.status === 404;
    return (
      <>
        <BackLink />
        <div className="rounded-xl border bg-card shadow-sm">
          {notFound ? (
            <NotFoundState title="Staff member not found" />
          ) : (
            <ErrorState error={member.error} onRetry={() => void member.refetch()} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <BackLink />
      <StaffHeader member={member.data} />
      <StaffSummary member={member.data} />
      <StaffDetailsCard member={member.data} />
    </>
  );
}
