"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createResidentAccount } from "@/lib/actions/admin";
import { getUnits } from "@/lib/actions/units";
import { UnitSelector } from "@/components/unit-selector";

interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
  monthly_fee?: number;
}

export default function CreateResidentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  // Fetch units on component mount
  useEffect(() => {
    async function fetchUnits() {
      try {
        const unitsData = await getUnits();
        setUnits(unitsData);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch units",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUnits(false);
      }
    }

    fetchUnits();
  }, [toast]);

  async function handleSubmit(formData: FormData) {
    if (!selectedUnitId) {
      toast({
        title: "Error",
        description: "Please select a unit",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add the selected unit ID to form data
      formData.set("unitId", selectedUnitId);

      await createResidentAccount(formData);
      toast({
        title: "Success",
        description: "Resident account created successfully",
      });
      router.push("/admin/residents");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create resident account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Resident Account
          </h1>
          <p className="text-muted-foreground">
            Create a new resident account in the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resident Information</CardTitle>
            <CardDescription>
              Enter the details for the new resident account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>

              <div className="grid gap-6 md:grid-cols-1">
                <div className="space-y-2">
                  <Label>Unit Selection</Label>
                  {isLoadingUnits ? (
                    <div className="flex items-center justify-center p-8 border rounded-lg">
                      <div className="text-muted-foreground">
                        Loading units...
                      </div>
                    </div>
                  ) : (
                    <UnitSelector
                      units={units}
                      selectedUnitId={selectedUnitId}
                      onUnitSelect={setSelectedUnitId}
                      showOnlyVacant={true}
                      placeholder="Select a unit for the resident"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residencyType">Residency Type</Label>
                <Select name="residencyType" defaultValue="tenant">
                  <SelectTrigger>
                    <SelectValue placeholder="Select residency type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner-occupied">
                      Owner Occupied
                    </SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="family-member">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <Input id="moveInDate" name="moveInDate" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialPassword">Initial Password</Label>
                <Input
                  id="initialPassword"
                  name="initialPassword"
                  type="password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be the resident's initial password. They will be
                  prompted to change it on first login.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !selectedUnitId}>
                  {isLoading ? "Creating..." : "Create Resident Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
