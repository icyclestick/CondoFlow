import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import UnitsPageClient from "./UnitsPageClient";

export default async function UnitsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <UnitsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
