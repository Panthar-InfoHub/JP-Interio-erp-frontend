"use client";

import { Monitor, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date";
import { describeDevice } from "@/lib/format/device";
import type { SessionItem } from "@/types/auth";

interface DeviceRowProps {
  session: SessionItem;
  ending: boolean;
  onEnd: (session: SessionItem) => void;
}

/** One logged-in device. "This device" can't be ended here (use Log out). */
export function DeviceRow({ session, ending, onEnd }: DeviceRowProps) {
  const isPhone = /Android|iPhone|iPad|Mobile/.test(session.userAgent ?? "");
  const Icon = isPhone ? Smartphone : Monitor;

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {describeDevice(session.deviceName, session.userAgent)}
            {session.isCurrent ? <Badge>This device</Badge> : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last used {formatDateTime(session.lastUsedAt)}
            {session.ip ? ` · IP ${session.ip}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Logged in {formatDateTime(session.createdAt)}
          </p>
        </div>
      </div>
      {session.isCurrent ? null : (
        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          disabled={ending}
          onClick={() => onEnd(session)}
        >
          Log out this device
        </Button>
      )}
    </li>
  );
}
