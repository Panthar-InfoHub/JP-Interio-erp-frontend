import { PageHeader } from "@/components/layout/PageHeader";
import { DevicesCard } from "@/components/profile/DevicesCard";
import { ProfileDetailsCard } from "@/components/profile/ProfileDetailsCard";

export function ProfileScreen() {
  return (
    <>
      <PageHeader title="My profile" description="Your details and the devices you use." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileDetailsCard />
        <DevicesCard />
      </div>
    </>
  );
}
