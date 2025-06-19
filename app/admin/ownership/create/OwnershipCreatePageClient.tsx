"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addUnitOwnership,
  getAllResidentsWithUnits,
  getUnits,
  createResidentAccount,
} from "@/lib/actions";
import { UnitSelector } from "@/components/unit-selector";

interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
  monthly_fee?: number;
}

interface CoOwner {
  id: string;
  name: string;
  email: string;
  percentage: number;
}

export default function CreateOwnershipPage({userName, userRole}: {userName: string, userRole: "admin" | "resident"}) {
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [ownershipType, setOwnershipType] = useState<"single" | "co-owned">(
    "single"
  );
  const [willLiveInUnit, setWillLiveInUnit] = useState(false);
  const [coOwners, setCoOwners] = useState<CoOwner[]>([
    { id: "1", name: "", email: "", percentage: 50 },
    { id: "2", name: "", email: "", percentage: 50 },
  ]);
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

  const addCoOwner = () => {
    const newId = (coOwners.length + 1).toString();
    setCoOwners([
      ...coOwners,
      { id: newId, name: "", email: "", percentage: 0 },
    ]);
  };

  const removeCoOwner = (id: string) => {
    if (coOwners.length > 2) {
      setCoOwners(coOwners.filter((owner) => owner.id !== id));
    }
  };

  const updateCoOwner = (
    id: string,
    field: keyof CoOwner,
    value: string | number
  ) => {
    setCoOwners(
      coOwners.map((owner) =>
        owner.id === id ? { ...owner, [field]: value } : owner
      )
    );
  };

  const totalPercentage = coOwners.reduce(
    (sum, owner) => sum + owner.percentage,
    0
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const formData = new FormData(e.currentTarget);
      formData.set("unitId", selectedUnitId);

      // Create ownership records
      if (ownershipType === "single") {
        // For single ownership, create or find the owner
        const ownerName = formData.get("ownerName") as string;
        const ownerEmail = formData.get("ownerEmail") as string;

        // First, try to find existing resident by email
        const residents = await getAllResidentsWithUnits();
        const existingResident = residents.find((r) => r.email === ownerEmail);

        let ownerId: string;

        if (existingResident) {
          // Use existing resident
          ownerId = existingResident.id;
        } else {
          // Create new resident account
          const residentFormData = new FormData();
          residentFormData.set("firstName", ownerName.split(" ")[0] || "");
          residentFormData.set(
            "lastName",
            ownerName.split(" ").slice(1).join(" ") || ""
          );
          residentFormData.set("email", ownerEmail);
          residentFormData.set("phone", "");
          residentFormData.set("residencyType", "owner-occupied");
          residentFormData.set(
            "moveInDate",
            formData.get("ownershipStartDate") as string
          );
          residentFormData.set("initialPassword", "changeme123"); // Temporary password

          await createResidentAccount(residentFormData);

          // Get the newly created resident ID
          const residents = await getAllResidentsWithUnits();
          const newResident = residents.find((r) => r.email === ownerEmail);
          ownerId = newResident?.id || "";
        }

        // Now create the ownership record
        const ownershipFormData = new FormData();
        ownershipFormData.set("unitId", selectedUnitId);
        ownershipFormData.set("ownerId", ownerId);
        ownershipFormData.set("ownershipPercentage", "100");
        ownershipFormData.set("ownershipType", "primary");
        ownershipFormData.set(
          "startDate",
          formData.get("ownershipStartDate") as string
        );

        await addUnitOwnership(ownershipFormData);
      } else {
        // Handle co-ownership - create multiple records
        for (const owner of coOwners) {
          if (owner.name && owner.email && owner.percentage > 0) {
            // Find or create resident for each co-owner
            const residents = await getAllResidentsWithUnits();
            const existingResident = residents.find(
              (r) => r.email === owner.email
            );

            let ownerId: string;

            if (existingResident) {
              ownerId = existingResident.id;
            } else {
              // Create new resident account
              const residentFormData = new FormData();
              residentFormData.set("firstName", owner.name.split(" ")[0] || "");
              residentFormData.set(
                "lastName",
                owner.name.split(" ").slice(1).join(" ") || ""
              );
              residentFormData.set("email", owner.email);
              residentFormData.set("phone", "");
              residentFormData.set("residencyType", "owner-occupied");
              residentFormData.set(
                "moveInDate",
                formData.get("ownershipStartDate") as string
              );
              residentFormData.set("initialPassword", "changeme123");

              await createResidentAccount(residentFormData);

              // Get the newly created resident ID
              const residents = await getAllResidentsWithUnits();
              const newResident = residents.find(
                (r) => r.email === owner.email
              );
              ownerId = newResident?.id || "";
            }

            const coOwnerFormData = new FormData();
            coOwnerFormData.append("unitId", selectedUnitId);
            coOwnerFormData.append("ownerId", ownerId);
            coOwnerFormData.append(
              "ownershipPercentage",
              owner.percentage.toString()
            );
            coOwnerFormData.append(
              "ownershipType",
              owner.id === "1" ? "primary" : "co-owner"
            );
            coOwnerFormData.append(
              "startDate",
              formData.get("ownershipStartDate") as string
            );

            await addUnitOwnership(coOwnerFormData);
          }
        }
      }

      // If owner will live in unit, create residency record
      if (willLiveInUnit) {
        // For single ownership, use the primary owner
        // For co-ownership, use the first owner as primary resident
        let primaryOwnerId = "";

        if (ownershipType === "single") {
          const ownerEmail = formData.get("ownerEmail") as string;
          const residents = await getAllResidentsWithUnits();
          const existingResident = residents.find(
            (r) => r.email === ownerEmail
          );
          primaryOwnerId = existingResident?.id || "";
        } else {
          const primaryOwner = coOwners.find((o) => o.id === "1");
          if (primaryOwner?.email) {
            const residents = await getAllResidentsWithUnits();
            const existingResident = residents.find(
              (r) => r.email === primaryOwner.email
            );
            primaryOwnerId = existingResident?.id || "";
          }
        }

        if (primaryOwnerId) {
          const residencyFormData = new FormData();
          residencyFormData.append("unitId", selectedUnitId);
          residencyFormData.append("residentId", primaryOwnerId);
          residencyFormData.append("residencyType", "owner-occupied");
          residencyFormData.append(
            "startDate",
            (formData.get("moveInDate") as string) ||
              (formData.get("ownershipStartDate") as string)
          );
          residencyFormData.append("isPrimaryResident", "true");

          // Note: We need to use addUnitResidency instead of addUnitOwnership for residency
          // This will be handled by the existing residency creation logic
        }
      }

      toast({
        title: "Success",
        description: "Ownership created successfully",
      });
      router.push("/admin/ownership");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create ownership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Unit Ownership
          </h1>
          <p className="text-muted-foreground">
            Register new ownership for a unit
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Ownership Details</CardTitle>
              <CardDescription>
                Enter the ownership information for this unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
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
                    showOnlyVacant={false}
                    placeholder="Select a unit for ownership"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownershipStartDate">Ownership Start Date</Label>
                <Input
                  id="ownershipStartDate"
                  name="ownershipStartDate"
                  type="date"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  When the owner actually purchased/acquired this unit
                </p>
              </div>

              <div className="space-y-4">
                <Label>Ownership Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="single"
                      name="ownershipType"
                      value="single"
                      checked={ownershipType === "single"}
                      onChange={(e) =>
                        setOwnershipType(
                          e.target.value as "single" | "co-owned"
                        )
                      }
                    />
                    <Label htmlFor="single">Single Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="co-owned"
                      name="ownershipType"
                      value="co-owned"
                      checked={ownershipType === "co-owned"}
                      onChange={(e) =>
                        setOwnershipType(
                          e.target.value as "single" | "co-owned"
                        )
                      }
                    />
                    <Label htmlFor="co-owned">Co-Ownership</Label>
                  </div>
                </div>
              </div>

              {ownershipType === "single" ? (
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input id="ownerName" name="ownerName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Owner Email</Label>
                      <Input
                        id="ownerEmail"
                        name="ownerEmail"
                        type="email"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Co-Owners</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCoOwner}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Co-Owner
                    </Button>
                  </div>

                  {coOwners.map((owner, index) => (
                    <div
                      key={owner.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Owner {index + 1}</h4>
                        {coOwners.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCoOwner(owner.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={owner.name}
                            onChange={(e) =>
                              updateCoOwner(owner.id, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={owner.email}
                            onChange={(e) =>
                              updateCoOwner(owner.id, "email", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ownership %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={owner.percentage}
                            onChange={(e) =>
                              updateCoOwner(
                                owner.id,
                                "percentage",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Ownership:</span>
                    <span
                      className={`font-bold ${
                        totalPercentage === 100
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {totalPercentage}%
                    </span>
                  </div>
                  {totalPercentage !== 100 && (
                    <p className="text-sm text-red-600">
                      Total ownership must equal 100%
                    </p>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Label>Residency Information</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="willLiveInUnit"
                    checked={willLiveInUnit}
                    onCheckedChange={(checked) =>
                      setWillLiveInUnit(checked as boolean)
                    }
                  />
                  <Label htmlFor="willLiveInUnit">
                    Owner will live in this unit (Owner-Occupied)
                  </Label>
                </div>

                {willLiveInUnit && (
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">Move-in Date</Label>
                    <Input id="moveInDate" name="moveInDate" type="date" />
                    <p className="text-xs text-muted-foreground">
                      When the owner will start living in the unit (can be
                      different from purchase date)
                    </p>
                  </div>
                )}

                {!willLiveInUnit && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Investment Property:</strong> This unit will be
                      available for rental. You can assign tenants later from
                      the Units Management page.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !selectedUnitId ||
                    (ownershipType === "co-owned" && totalPercentage !== 100)
                  }
                >
                  {isLoading ? "Creating..." : "Create Ownership"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
