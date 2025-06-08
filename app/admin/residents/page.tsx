"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Home,
  Building,
} from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAllResidents,
  getResidentsByBlock,
  getResidentStats,
  deleteResident,
} from "@/lib/actions/residents";

// Enhanced type definitions
interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
}

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  move_in_date: string | null;
  avatar_url: string | null;
  units: Unit | null;
  residency_type: string | null;
  total_residing_units: number;
  total_owned_units: number;
}

interface ResidentStats {
  totalResidents: number;
  activeResidents: number;
  inactiveResidents: number;
  blockCounts: Record<string, number>;
}

export default function ResidentsPage() {
  // State management
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [stats, setStats] = useState<ResidentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { toast } = useToast();

  // Fetch residents data
  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      let data: Resident[];

      if (selectedBlock) {
        data = await getResidentsByBlock(selectedBlock);
      } else {
        data = await getAllResidents();
      }

      setResidents(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch residents",
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
      const statsData = await getResidentStats();
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

  // Initial data fetch
  useEffect(() => {
    fetchResidents();
    fetchStats();
  }, [selectedBlock]);

  // Filter residents based on search and filters
  useEffect(() => {
    let filtered = residents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (resident) =>
          resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (resident.units &&
            `${resident.units.block}${resident.units.unit_number}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus === "active") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(
        (resident) => new Date(resident.created_at) > thirtyDaysAgo
      );
    } else if (selectedStatus === "inactive") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(
        (resident) => new Date(resident.created_at) <= thirtyDaysAgo
      );
    }

    // Tab filter
    if (activeTab === "owners") {
      filtered = filtered.filter((resident) => resident.total_owned_units > 0);
    } else if (activeTab === "tenants") {
      filtered = filtered.filter(
        (resident) => resident.residency_type === "tenant"
      );
    }

    setFilteredResidents(filtered);
  }, [residents, searchTerm, selectedStatus, activeTab]);

  // Handle resident deletion
  const handleDeleteResident = async (
    residentId: string,
    residentName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete ${residentName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteResident(residentId);
      toast({
        title: "Success",
        description: `${residentName} has been deleted successfully`,
      });
      fetchResidents();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete resident",
        variant: "destructive",
      });
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get residency type badge
  const getResidencyBadge = (resident: Resident) => {
    if (
      resident.total_owned_units > 0 &&
      resident.residency_type === "owner-occupied"
    ) {
      return <Badge variant="default">Owner</Badge>;
    } else if (resident.residency_type === "tenant") {
      return <Badge variant="secondary">Tenant</Badge>;
    } else if (resident.residency_type === "family-member") {
      return <Badge variant="outline">Family</Badge>;
    } else {
      return <Badge variant="outline">Resident</Badge>;
    }
  };

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
            <p className="text-muted-foreground">
              Manage residents and their information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/residents/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Resident
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Residents
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.totalResidents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.activeResidents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active in last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.inactiveResidents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                No recent activity
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Populated Block
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading
                  ? "..."
                  : stats?.blockCounts &&
                    Object.keys(stats.blockCounts).length > 0
                  ? Object.entries(stats.blockCounts).reduce((a, b) =>
                      stats.blockCounts[a[0]] > stats.blockCounts[b[0]] ? a : b
                    )[0]
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isStatsLoading
                  ? "..."
                  : stats?.blockCounts &&
                    Object.keys(stats.blockCounts).length > 0
                  ? Math.max(...Object.values(stats.blockCounts)) + " residents"
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search residents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            <option value="">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
            <option value="D">Block D</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Tabs and Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value="owners">
              Owners ({residents.filter((r) => r.total_owned_units > 0).length})
            </TabsTrigger>
            <TabsTrigger value="tenants">
              Tenants (
              {residents.filter((r) => r.residency_type === "tenant").length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">
                      Loading residents...
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                          <th className="p-4">Name</th>
                          <th className="p-4">Primary Unit</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Units</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Move-in Date</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResidents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="p-8 text-center text-muted-foreground"
                            >
                              No residents found
                            </td>
                          </tr>
                        ) : (
                          filteredResidents.map((resident) => (
                            <tr key={resident.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={resident.avatar_url || undefined}
                                    />
                                    <AvatarFallback>
                                      {getInitials(resident.full_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {resident.full_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {resident.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                {resident.units
                                  ? `Block ${resident.units.block}, #${resident.units.unit_number}`
                                  : "No unit assigned"}
                              </td>
                              <td className="p-4">
                                {getResidencyBadge(resident)}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  {resident.total_residing_units > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Home className="h-3 w-3" />
                                      <span>
                                        {resident.total_residing_units}
                                      </span>
                                    </div>
                                  )}
                                  {resident.total_owned_units > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      <span>{resident.total_owned_units}</span>
                                    </div>
                                  )}
                                  {resident.total_residing_units === 0 &&
                                    resident.total_owned_units === 0 && (
                                      <span className="text-muted-foreground">
                                        None
                                      </span>
                                    )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="text-sm">{resident.email}</p>
                                  {resident.phone && (
                                    <p className="text-sm text-muted-foreground">
                                      {resident.phone}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                {formatDate(resident.move_in_date)}
                              </td>
                              <td className="p-4">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link
                                      href={`/admin/residents/${resident.id}`}
                                    >
                                      View
                                    </Link>
                                  </Button>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link
                                      href={`/admin/residents/${resident.id}/edit`}
                                    >
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteResident(
                                        resident.id,
                                        resident.full_name
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
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
