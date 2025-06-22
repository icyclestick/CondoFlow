import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import ViewOwnershipPageClient from "./ViewOwnershipPageClient";

export default async function ViewOwnershipPage({
  params,
}: {
  params: { ownershipId: string };
}) {
  const profile = await getCurrentUserProfile();
  return (
    <ViewOwnershipPageClient
      userName={profile.full_name}
      userRole={profile.role}
      ownershipId={params.ownershipId}
    />
  );
}
