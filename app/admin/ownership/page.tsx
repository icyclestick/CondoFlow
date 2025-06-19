"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Home, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUnitOwners,
  getOwnershipStats,
  addUnitOwnership,
  editUnitOwnership,
  transferUnitOwnership,
} from "@/lib/actions";
import Link from "next/link";

// Type definitions for ownership data
interface OwnershipRecord {
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
}

interface OwnershipStats {
  totalOwnedUnits: number;
  ownerOccupied: number;
  investmentProperties: number;
}

export default function OwnershipPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerships, setOwnerships] = useState<OwnershipRecord[]>([]);
  const [stats, setStats] = useState<OwnershipStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const { toast } = useToast();

  // Fetch ownership data
  const fetchOwnerships = async () => {
    try {
      setIsLoading(true);
      let data: any[] = await getAllUnitOwners();
      data = data
        .map((ownership) => ({
          ...ownership,
          profiles: Array.isArray(ownership.profiles)
            ? ownership.profiles[0]
            : ownership.profiles,
        }))
        .filter(
          (ownership) =>
            ownership.profiles &&
            typeof ownership.profiles.id === "string" &&
            typeof ownership.profiles.full_name === "string" &&
            typeof ownership.profiles.email === "string" &&
            !Array.isArray(ownership.profiles)
        );
      setOwnerships(data as OwnershipRecord[]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch ownership data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const statsData = await getOwnershipStats();
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch statistics",
        variant: "destructive",
      });
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerships();
    fetchStats();
  }, []);

  // Filter ownerships based on search
  const filteredOwnerships = ownerships.filter((ownership) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      ownership.profiles.full_name.toLowerCase().includes(searchLower) ||
      ownership.profiles.email.toLowerCase().includes(searchLower) ||
      `${ownership.units.block}${ownership.units.unit_number}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Group ownerships by unit for co-ownership detection
  const ownershipsByUnit = filteredOwnerships.reduce((acc, ownership) => {
    const unitKey = `${ownership.units.block}-${ownership.units.unit_number}`;
    if (!acc[unitKey]) {
      acc[unitKey] = [];
    }
    acc[unitKey].push(ownership);
    return acc;
  }, {} as Record<string, OwnershipRecord[]>);

  // Tab-based filtering
  let tabFilteredOwnerships = filteredOwnerships;
  if (activeTab === "owner-occupied") {
    tabFilteredOwnerships = filteredOwnerships.filter(
      (ownership) =>
        ownership.ownership_type === "primary" &&
        ownership.profiles.profile_type === "owner-occupied"
    );
  } else if (activeTab === "investment") {
    tabFilteredOwnerships = filteredOwnerships.filter(
      (ownership) =>
        ownership.ownership_type === "primary" &&
        ownership.profiles.profile_type !== "owner-occupied"
    );
  } else if (activeTab === "co-owned") {
    tabFilteredOwnerships = filteredOwnerships.filter((ownership) => {
      const unitKey = `${ownership.units.block}-${ownership.units.unit_number}`;
      return ownershipsByUnit[unitKey]?.length > 1;
    });
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get ownership type badge
  const getOwnershipTypeBadge = (
    ownership: OwnershipRecord,
    isCoOwned: boolean
  ) => {
    if (isCoOwned) {
      return <Badge variant="outline">Co-Owned</Badge>;
    }
    if (ownership.ownership_type === "primary") {
      return <Badge variant="default">Primary Owner</Badge>;
    }
    return <Badge variant="secondary">{ownership.ownership_type}</Badge>;
  };

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Unit Ownership Management
            </h1>
            <p className="text-muted-foreground">
              Manage unit ownership, transfers, and co-ownership arrangements
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/ownership/transfer">
                <DollarSign className="mr-2 h-4 w-4" />
                Transfer Ownership
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/ownership/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Owner
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Owned Units
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.totalOwnedUnits || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Units with active ownership
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Owner-Occupied
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.ownerOccupied || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Owners living in their units
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Investment Properties
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.investmentProperties || 0}
              </div>
              <p className="text-xs text-muted-foreground">Rented to tenants</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Co-Owned Units
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  Object.values(ownershipsByUnit).filter(
                    (owners) => owners.length > 1
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Multiple owners</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by owner name or unit..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Ownership</TabsTrigger>
            <TabsTrigger value="owner-occupied">Owner-Occupied</TabsTrigger>
            <TabsTrigger value="investment">Investment Properties</TabsTrigger>
            <TabsTrigger value="co-owned">Co-Owned</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">
                      Loading ownership data...
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                          <th className="p-4">Unit</th>
                          <th className="p-4">Owner</th>
                          <th className="p-4">Ownership %</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Start Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabFilteredOwnerships.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="p-8 text-center text-muted-foreground"
                            >
                              No ownership records found
                            </td>
                          </tr>
                        ) : (
                          tabFilteredOwnerships.map((ownership) => {
                            const unitKey = `${ownership.units.block}-${ownership.units.unit_number}`;
                            const isCoOwned =
                              ownershipsByUnit[unitKey]?.length > 1;

                            return (
                              <tr key={ownership.id} className="border-b">
                                <td className="p-4 font-medium">
                                  Block {ownership.units.block}, #
                                  {ownership.units.unit_number}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {ownership.profiles.full_name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {ownership.profiles.email}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {ownership.ownership_percentage}%
                                </td>
                                <td className="p-4">
                                  {getOwnershipTypeBadge(ownership, isCoOwned)}
                                </td>
                                <td className="p-4">
                                  {formatDate(ownership.start_date)}
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant={
                                      ownership.is_active
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {ownership.is_active
                                      ? "Active"
                                      : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      View
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      Transfer
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
