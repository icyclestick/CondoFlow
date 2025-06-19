import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import UnitDetailsPageClient from "./UnitsEditPageClient";

export default async function UnitDetailsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <UnitDetailsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}