import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import AdminMoveRequestsPageClient from "./MoveRequestPageClient";

export default async function AdminMoveRequestsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AdminMoveRequestsPageClient
      userName={profile.full_name}
      userRole={profile.role as "admin" | "resident"}
    />
  );
}
