"use client";

import { usePathname, useRouter } from "next/navigation";

import { DataTable } from "@/components/data-table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { subAdminColumns } from "@/components/sub-admins/subAdminColumns";
import { useSubAdmins } from "@/hooks/sub-admins/useSubAdmins";
import { withFrom } from "@/lib/navigation/returnTo";

/**
 * Sub-Admins and their areas (Admin only, `sub_admins.manage`, DEC-301, DEC-302): every
 * Sub-Admin in any status, oldest first, as one list (the server sends it whole). A row opens
 * their staff page; "Edit areas" opens the tick-box pop-up. New Sub-Admins are added on Staff.
 */
export function SubAdminsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const subAdmins = useSubAdmins();

  return (
    <>
      <PageHeader
        title="Sub-Admins"
        description="Each Sub-Admin works only in the areas you give them. Add new Sub-Admins on the Staff page."
      />
      <DataTable
        columns={subAdminColumns}
        data={subAdmins.data}
        getRowId={(row) => row.id}
        isPending={subAdmins.isPending}
        isFetching={subAdmins.isFetching}
        error={subAdmins.error}
        onRetry={() => void subAdmins.refetch()}
        // The staff page's back link returns here (DEC-302).
        onRowClick={(row) => router.push(withFrom(`/staff/${row.id}`, pathname))}
        emptyTitle="No Sub-Admins yet"
        emptyDescription="Add one on the Staff page, then give them areas here."
      />
    </>
  );
}
