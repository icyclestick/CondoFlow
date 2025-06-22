import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import AdminPaymentsPageClient from "./PaymentsPageClient";

export default async function AdminPaymentsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <AdminPaymentsPageClient
      userName={profile.full_name}
      userRole={profile.role as "admin" | "resident"}
    />
  );
}
