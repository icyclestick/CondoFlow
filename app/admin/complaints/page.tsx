import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import ComplaintsPageClient from "./ComplaintsPageClient";

export default async function AdminComplaintsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <ComplaintsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}