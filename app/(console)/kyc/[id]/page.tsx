import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/common/RequirePermission";
import { KycReviewScreen } from "@/components/kyc/KycReviewScreen";

export const metadata: Metadata = { title: "KYC review" };

// The partner id comes from the address (useParams), so the screen sits in Suspense.
export default function KycReviewPage() {
  return (
    <RequirePermission anyOf={["kyc.verify"]}>
      <Suspense>
        <KycReviewScreen />
      </Suspense>
    </RequirePermission>
  );
}
