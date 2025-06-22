import GatepassPageClient from "./GatepassResidentPageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function GatepassPage() {
  const profile = await getCurrentUserProfile();
  return (
    <GatepassPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
