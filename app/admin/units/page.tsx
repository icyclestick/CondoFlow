import UnitsPageClient from "./UnitsPageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function AdminUnitsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <UnitsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
