import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import VisitorsPageClient from "./VisitorsPageClient";

export default async function VisitorsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <VisitorsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
