import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import ServicesPageClient from "./ServicesPageClient";

export default async function AdminServicesPage() {
  const profile = await getCurrentUserProfile();

  return (
    <ServicesPageClient
      userName={profile.full_name}
      userRole={profile.role as "admin" | "resident"}
    />
  );
}
