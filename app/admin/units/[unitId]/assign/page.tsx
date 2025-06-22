import AssignUnitPageClient from "./UnitsAssignPageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function AssignUnitPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AssignUnitPageClient
      userName={profile.full_name}
      userRole={profile.role}
    />
  );
}
