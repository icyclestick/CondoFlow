import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import CreateOwnershipPageClient from "./OwnershipCreatePageClient";

export default async function CreateOwnershipPage() {
  const profile = await getCurrentUserProfile();
  return (
    <CreateOwnershipPageClient userName={profile.full_name} userRole={profile.role} />
  );
}

