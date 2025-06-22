import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import EditOwnershipPageClient from "./EditOwnershipPageClient";

export default async function EditOwnershipPage({
  params,
}: {
  params: { ownershipId: string };
}) {
  const profile = await getCurrentUserProfile();
  return (
    <EditOwnershipPageClient
      userName={profile.full_name}
      userRole={profile.role}
      ownershipId={params.ownershipId}
    />
  );
}
