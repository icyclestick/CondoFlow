import { Suspense } from "react";
import { VisitorsPageClient } from "./VisitorsPageClient";
import { getMyProfile } from "@/lib/actions/resident/resident-profile";

export default async function AdminVisitorsPage() {
  const profile = await getMyProfile();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisitorsPageClient
        userName={profile?.full_name || "Admin"}
        userRole="admin"
      />
    </Suspense>
  );
} 