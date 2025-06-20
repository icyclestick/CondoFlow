import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import ServicesPageClient from "./ServicesPageClient";

export default async function ServicesPage() {
  const profile = await getCurrentUserProfile();
  return (
    <ServicesPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
