import ResidentsPageClient from "./ResidentsPageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function AdminResidentsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <ResidentsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
