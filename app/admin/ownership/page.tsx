import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import OwnershipPageClient from "@/app/admin/ownership/OwnershipPageClient";

export default async function OwnershipPage() {
  const profile = await getCurrentUserProfile();
  return (
    <OwnershipPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
