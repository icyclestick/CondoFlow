import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import AdminGatepassPageClient from "./GatepassPageClient";

export default async function AdminGatepassPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AdminGatepassPageClient
      userName={profile.full_name}
      userRole={profile.role as "admin" | "resident"}
    />
  );
}
