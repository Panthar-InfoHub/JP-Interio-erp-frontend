import { FileQuestion, Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

function Shell({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-12 text-center",
        className,
      )}
    >
      <div className="mb-1 text-muted-foreground [&_svg]:size-8">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      {children}
    </div>
  );
}

/** "Nothing here yet" for an empty list or a filter with no results. */
export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Shell icon={<Inbox aria-hidden />} title={title} className={className}>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </Shell>
  );
}

/** The server's error message, the request id to report, and "Try again". */
export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const message = isApiError(error) ? error.message : "Something went wrong. Please try again.";
  const requestId = isApiError(error) ? error.requestId : undefined;

  return (
    <Shell icon={<TriangleAlert aria-hidden />} title="Couldn't load this" className={className}>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {requestId ? (
        <p className="text-xs text-muted-foreground">
          Reference: <span className="font-mono select-all">{requestId}</span>
        </p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
      ) : null}
    </Shell>
  );
}

/**
 * "Not found". Also used for records outside the person's scope: the server answers
 * 404 for those, never "no access" (R2).
 */
export function NotFoundState({
  title = "Not found",
  description = "This page or record doesn't exist, or you can't open it.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Shell icon={<FileQuestion aria-hidden />} title={title} className={className}>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {/* A link that looks like a button: tell Base UI it is not a native <button>. */}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        Go to the dashboard
      </Button>
    </Shell>
  );
}
