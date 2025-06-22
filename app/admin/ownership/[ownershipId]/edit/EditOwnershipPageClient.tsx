"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { editUnitOwnership, getOwnershipDetails } from "@/lib/actions";

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

interface EditOwnershipPageClientProps {
  userName: string;
  userRole: string;
  ownershipId: string;
}

export default function EditOwnershipPageClient({
  userName,
  userRole,
  ownershipId,
}: EditOwnershipPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ownership, setOwnership] = useState<OwnershipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [ownershipPercentage, setOwnershipPercentage] = useState(100);
  const [ownershipType, setOwnershipType] = useState("primary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchOwnershipDetails() {
      try {
        setIsLoading(true);
        const data = await getOwnershipDetails(ownershipId);
        setOwnership(data);
        setOwnershipPercentage(data.ownership_percentage);
        setOwnershipType(data.ownership_type);
        setStartDate(data.start_date.split("T")[0]);
        setEndDate(data.end_date ? data.end_date.split("T")[0] : "");
        setIsActive(data.is_active);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("ownershipPercentage", ownershipPercentage.toString());
      formData.set("ownershipType", ownershipType);
      formData.set("startDate", startDate);
      formData.set("endDate", endDate);
      formData.set("isActive", isActive.toString());

      await editUnitOwnership(ownershipId, formData);

      toast({
        title: "Success",
        description: "Ownership details updated successfully",
      });

      router.push("/admin/ownership");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update ownership",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              Edit Ownership
            </h1>
            <p className="text-muted-foreground">
              Update ownership details and settings
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownershipPercentage">
                    Ownership Percentage
                  </Label>
                  <Input
                    id="ownershipPercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={ownershipPercentage}
                    onChange={(e) =>
                      setOwnershipPercentage(Number(e.target.value))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownershipType">Ownership Type</Label>
                  <Select
                    value={ownershipType}
                    onValueChange={setOwnershipType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Owner</SelectItem>
                      <SelectItem value="co-owner">Co-Owner</SelectItem>
                      <SelectItem value="trustee">Trustee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) =>
                      setIsActive(checked as boolean)
                    }
                  />
                  <Label htmlFor="isActive">Active Ownership</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Block
                    </Label>
                    <p className="text-lg font-semibold">
                      {ownership.units.block}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Unit Number
                    </Label>
                    <p className="text-lg font-semibold">
                      {ownership.units.unit_number}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Owner
                  </Label>
                  <p className="text-lg font-semibold">
                    {ownership.profiles.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ownership.profiles.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/ownership">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
