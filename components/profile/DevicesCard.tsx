"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeviceRow } from "@/components/profile/DeviceRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/hooks/auth/useLogout";
import { useRevokeSession, useSessions } from "@/hooks/auth/useSessions";
import { isApiError } from "@/lib/api/errors";
import { describeDevice } from "@/lib/format/device";
import type { SessionItem } from "@/types/auth";

/** Where I'm logged in; end one device, or log out everywhere. */
export function DevicesCard() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const logout = useLogout();
  const [toEnd, setToEnd] = useState<SessionItem | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const endDevice = () => {
    if (!toEnd) return;
    revoke.mutate(toEnd.id, {
      onSuccess: () => toast.success("Device logged out"),
      onError: (error) =>
        toast.error(isApiError(error) ? error.message : "Could not log out that device."),
      onSettled: () => setToEnd(null),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My devices</CardTitle>
        <CardDescription>Browsers where you are logged in now.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => setConfirmAll(true)}>
            <LogOut data-icon="inline-start" />
            Log out everywhere
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {sessions.isPending ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : sessions.isError ? (
          <div className="flex flex-col items-start gap-3 text-sm">
            <p className="text-destructive">{sessions.error.message}</p>
            <Button variant="outline" size="sm" onClick={() => void sessions.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {sessions.data.map((session) => (
              <DeviceRow
                key={session.id}
                session={session}
                ending={revoke.isPending && revoke.variables === session.id}
                onEnd={setToEnd}
              />
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog open={toEnd !== null} onOpenChange={(open) => !open && setToEnd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out this device?</AlertDialogTitle>
            <AlertDialogDescription>
              {toEnd ? describeDevice(toEnd.deviceName, toEnd.userAgent) : ""} will have to log in
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={endDevice} disabled={revoke.isPending}>
              Log out device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out everywhere?</AlertDialogTitle>
            <AlertDialogDescription>
              Every device will be logged out, including this one. Use this if you lost a device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logout.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => logout.mutate({ everywhere: true })}
              disabled={logout.isPending}
            >
              Log out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
