import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import MoveRequestsPageClient from "./MoveRequestsPageClient";

export default async function MoveRequestsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <MoveRequestsPageClient
      userName={profile.full_name}
      userRole={profile.role}
    />
  );
}
