import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import AmenitiesPageClient from "./AmenitiesPageClient";

export default async function AmenitiesPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AmenitiesPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
