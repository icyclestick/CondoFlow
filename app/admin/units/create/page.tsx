import AddUnitPageClient from "./UnitsCreatePageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function AddUnitPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AddUnitPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
