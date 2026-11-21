"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { areaLabel, roleLabel } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { useAuthStore } from "@/stores/auth.store";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** My details. Name and email can be edited; the phone only by my manager. */
export function ProfileDetailsCard() {
  const user = useAuthStore((state) => state.user);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My details</CardTitle>
        {editing ? null : (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <ProfileEditForm
            name={user.name ?? ""}
            email={user.email}
            onDone={() => setEditing(false)}
          />
        ) : (
          <dl className="flex flex-col gap-4">
            <DetailRow label="Name">{user.name ?? "—"}</DetailRow>
            <DetailRow label="Mobile">
              {formatPhone(user.phone)}
              <span className="block text-xs text-muted-foreground">
                To change it, ask your manager.
              </span>
            </DetailRow>
            <DetailRow label="Email">{user.email ?? "—"}</DetailRow>
            <DetailRow label="Role">{roleLabel(user.role.key)}</DetailRow>
            {user.zone ? (
              <DetailRow label="Zone">
                {user.zone.name} ({user.zone.code})
              </DetailRow>
            ) : null}
            {user.role.key === "sub_admin" ? (
              <DetailRow label="Areas">
                {user.subAdminAreas.length === 0 ? (
                  <span className="text-muted-foreground">No areas yet</span>
                ) : (
                  <span className="flex flex-wrap gap-1.5">
                    {user.subAdminAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {areaLabel(area)}
                      </Badge>
                    ))}
                  </span>
                )}
              </DetailRow>
            ) : null}
            <DetailRow label="Member since">{formatDate(user.createdAt)}</DetailRow>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
