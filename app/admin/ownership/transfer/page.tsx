import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import TransferOwnershipPageClient from "./OwnershipTransferPageClient";

export default async function TransferOwnershipPage() {
  const profile = await getCurrentUserProfile();
  return (
    <TransferOwnershipPageClient userName={profile.full_name} userRole={profile.role} />
  );
}
