import CreateResidentPageClient from "./ResidentsCreatePageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function CreateResidentPage() {
  const profile = await getCurrentUserProfile();
  return (
    <CreateResidentPageClient
      userName={profile.full_name}
      userRole={profile.role}
    />
  );
}
