"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  User,
  Home,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getOwnershipDetails } from "@/lib/actions";

interface OwnershipDetails {
  id: string;
  ownership_percentage: number;
  ownership_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    profile_type: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
  units: {
    id: string;
    block: string;
    unit_number: string;
    status: string;
    monthly_fee: number | null;
  };
  is_owner_occupied: boolean;
}

interface ViewOwnershipPageClientProps {
  userName: string;
  userRole: string;
  ownershipId: string;
}

export default function ViewOwnershipPageClient({
  userName,
  userRole,
  ownershipId,
}: ViewOwnershipPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ownership, setOwnership] = useState<OwnershipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOwnershipDetails() {
      try {
        setIsLoading(true);
        const data = await getOwnershipDetails(ownershipId);
        setOwnership(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch ownership details",
          variant: "destructive",
        });
        router.push("/admin/ownership");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOwnershipDetails();
  }, [ownershipId, toast, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout
        userRole={userRole as "admin" | "resident"}
        userName={userName}
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">
            Loading ownership details...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!ownership) {
    return (
      <MainLayout
        userRole={userRole as "admin" | "resident"}
        userName={userName}
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Ownership not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/ownership">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ownership Details
            </h1>
            <p className="text-muted-foreground">
              View detailed information about this ownership record
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/ownership/${ownership.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={`/admin/ownership/transfer?ownershipId=${ownership.id}`}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Transfer
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Unit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Block
                  </label>
                  <p className="text-lg font-semibold">
                    {ownership.units.block}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Unit Number
                  </label>
                  <p className="text-lg font-semibold">
                    {ownership.units.unit_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge variant="default">{ownership.units.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Monthly Fee
                  </label>
                  <p className="text-lg font-semibold">
                    {ownership.units.monthly_fee
                      ? `$${ownership.units.monthly_fee}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-lg font-semibold">
                    {ownership.profiles.full_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-lg">{ownership.profiles.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <p className="text-lg">{ownership.profiles.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Verification
                  </label>
                  <Badge
                    variant={
                      ownership.profiles.is_verified ? "default" : "secondary"
                    }
                  >
                    {ownership.profiles.is_verified
                      ? "Verified"
                      : "Not Verified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ownership Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ownership %
                  </label>
                  <p className="text-lg font-semibold">
                    {ownership.ownership_percentage}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Type
                  </label>
                  <Badge variant="default">{ownership.ownership_type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    variant={ownership.is_active ? "default" : "secondary"}
                  >
                    {ownership.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Occupancy
                  </label>
                  <Badge
                    variant={
                      ownership.is_owner_occupied ? "outline" : "secondary"
                    }
                  >
                    {ownership.is_owner_occupied
                      ? "Owner-Occupied"
                      : "Investment Property"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </label>
                  <p className="text-lg font-semibold">
                    {formatDate(ownership.start_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    End Date
                  </label>
                  <p className="text-lg">
                    {ownership.end_date ? formatDate(ownership.end_date) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
