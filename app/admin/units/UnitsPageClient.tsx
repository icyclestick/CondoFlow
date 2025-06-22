"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { getUnits } from "@/lib/actions";
import {
  getUnitsByBlock,
  searchUnits,
  updateUnitStatus,
  addUnit,
  deleteUnit,
  getVacantUnits,
} from "@/lib/actions";
import Link from "next/link";

interface ResidentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface UnitResidency {
  id: string;
  resident_id: string;
  is_active: boolean;
  is_primary_resident: boolean;
  start_date: string;
  end_date: string | null;
  profiles: ResidentProfile;
}

interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
  monthly_fee: number | null;
  unit_residency?: UnitResidency[];
}

export default function UnitsPage({userName, userRole}: {userName: string, userRole: "admin" | "resident"}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAllUnits = async () => {
    try {
      const data = await getUnits();
      const formattedData = data.map((unit: any) => ({
        ...unit,
        unit_residency: unit.unit_residency?.map((residency: any) => ({
          ...residency,
          profiles: Array.isArray(residency.profiles)
            ? residency.profiles[0]
            : residency.profiles ?? null,
        })),
      }));
      setAllUnits(formattedData);
    } catch (error) {
      console.error("Error fetching all units:", error);
    }
  };

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data;

      if (activeTab === "vacant") {
        data = await getVacantUnits();
      } else if (searchTerm) {
        data = await searchUnits(searchTerm);
      } else if (selectedBlock) {
        data = await getUnitsByBlock(selectedBlock);
      } else {
        data = await getUnits();
      }

      const formattedData = data.map((unit: any) => ({
        ...unit,
        unit_residency: unit.unit_residency?.map((residency: any) => ({
          ...residency,
          profiles: Array.isArray(residency.profiles)
            ? residency.profiles[0]
            : residency.profiles ?? null,
        })),
      }));

      setUnits(formattedData);
    } catch (error) {
      console.log("Error fetching units:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch units"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUnits();
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUnits();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedBlock]);

  const filteredUnits = units.filter((unit) => {
    if (activeTab === "all") return true;
    if (activeTab === "vacant") return true;
    return unit.status.toLowerCase() === activeTab;
  });

  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter(
    (unit) => unit.status.toLowerCase() === "occupied"
  ).length;
  const vacantUnits = allUnits.filter(
    (unit) => unit.status.toLowerCase() === "vacant"
  ).length;
  const monthlyRevenue = allUnits
    .filter((unit) => unit.status.toLowerCase() === "occupied")
    .reduce((sum, unit) => sum + (unit.monthly_fee || 0), 0);

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Units Management
            </h1>
            <p className="text-muted-foreground">
              Manage condo units and their occupancy
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/units/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs text-muted-foreground">Across 4 blocks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupiedUnits}</div>
              <p className="text-xs text-muted-foreground">
                {totalUnits > 0
                  ? Math.round((occupiedUnits / totalUnits) * 100)
                  : 0}
                % occupancy rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vacantUnits}</div>
              <p className="text-xs text-muted-foreground">
                Available for rent
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From occupied units
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search units..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Blocks</option>
            <option value="N">North Tower (N)</option>
            <option value="S">South Tower (S)</option>
          </select>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Units</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="vacant">Vacant</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Unit</th>
                        <th className="p-4">Block</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Resident</th>
                        <th className="p-4">Monthly Fee</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center">
                            Loading
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-4 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center">
                            No units found
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((unit, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4 font-medium">
                              {unit.unit_number}
                            </td>
                            <td className="p-4">{unit.block}</td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  unit.status.toLowerCase() === "occupied"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {unit.status.charAt(0).toUpperCase() +
                                  unit.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {unit.unit_residency &&
                              unit.unit_residency.length > 0 ? (
                                unit.unit_residency
                                  .filter((r) => r.is_active && r.profiles)
                                  .map((r) => r.profiles.full_name)
                                  .join(", ")
                              ) : (
                                <span className="text-muted-foreground">
                                  No residents
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-medium">
                              {unit.monthly_fee ? `$${unit.monthly_fee}` : "-"}
                            </td>
                            <td className="p-4">
                              {unit.unit_residency &&
                              unit.unit_residency.length > 0 ? (
                                new Date(
                                  unit.unit_residency[0].start_date
                                ).toLocaleDateString()
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                                {unit.status.toLowerCase() === "vacant" && (
                                  <Button size="sm" asChild>
                                    <Link
                                      href={`/admin/units/${unit.id}/assign`}
                                    >
                                      Assign
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="occupied" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Unit</th>
                        <th className="p-4">Block</th>
                        <th className="p-4">Resident</th>
                        <th className="p-4">Monthly Fee</th>
                        <th className="p-4">Move-in Date</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            Loading
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            No occupied units found
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((unit, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4 font-medium">
                              {unit.unit_number}
                            </td>
                            <td className="p-4">{unit.block}</td>
                            <td className="p-4">
                              {unit.unit_residency &&
                              unit.unit_residency.length > 0 ? (
                                unit.unit_residency
                                  .filter((r) => r.is_active && r.profiles)
                                  .map((r) => r.profiles.full_name)
                                  .join(", ")
                              ) : (
                                <span className="text-muted-foreground">
                                  No residents
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-medium">
                              {unit.monthly_fee ? `$${unit.monthly_fee}` : "-"}
                            </td>
                            <td className="p-4">
                              {unit.unit_residency &&
                              unit.unit_residency.length > 0 ? (
                                new Date(
                                  unit.unit_residency[0].start_date
                                ).toLocaleDateString()
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vacant" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-4">Unit</th>
                        <th className="p-4">Block</th>
                        <th className="p-4">Monthly Fee</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center">
                            Loading
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-4 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center">
                            No vacant units found
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((unit, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4 font-medium">
                              {unit.unit_number}
                            </td>
                            <td className="p-4">{unit.block}</td>
                            <td className="p-4 font-medium">
                              {unit.monthly_fee ? `$${unit.monthly_fee}` : "-"}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/units/${unit.id}/edit`}>
                                    Edit
                                  </Link>
                                </Button>
                                <Button size="sm" asChild>
                                  <Link href={`/admin/units/${unit.id}/assign`}>
                                    Assign
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
