import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

// Every panel address that has no page of its own yet ("coming soon" or "Not found").
// Real pages (e.g. app/(console)/payouts/page.tsx) take priority over this one.
export default function SectionPage() {
  return <SectionPlaceholder />;
}
