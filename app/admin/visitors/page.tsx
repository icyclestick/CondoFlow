import { Suspense } from "react";
import VisitorsPageClient from "./VisitorsPageClient";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";

export default async function AdminVisitorsPage() {
  const profile = await getCurrentUserProfile();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisitorsPageClient
        userName={profile?.full_name || "Admin"}
        userRole="admin"
      />
    </Suspense>
  );
}
