import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import PaymentsPageClient from "./PaymentsPageClient";

export default async function PaymentsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <PaymentsPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
