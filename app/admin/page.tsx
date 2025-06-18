"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  MessageSquare,
  Users,
} from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  getResidentStats,
  getAmenityStats,
  getMoveRequestStats,
  getGatepassStats,
  getComplaintStats,
  getPaymentStats,
  getOwnershipStats,
} from "@/lib/actions";

interface DashboardStats {
  residents: {
    totalResidents: number;
    activeResidents: number;
    inactiveResidents: number;
  };
  payments: {
    totalRevenue: number;
    outstandingAmount: number;
    collectionRate: number;
    overdueAmount: number;
    outstandingCount: number;
    overdueCount: number;
  };
  moveRequests: {
    pendingRequests: number;
  };
  complaints: {
    openComplaints: number;
  };
  ownership: {
    totalOwnedUnits: number;
    ownerOccupied: number;
    investmentProperties: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [
          residentStats,
          amenityStats,
          moveRequestStats,
          gatepassStats,
          complaintStats,
          paymentStats,
          ownershipStats,
        ] = await Promise.all([
          getResidentStats(),
          getAmenityStats(),
          getMoveRequestStats(),
          getGatepassStats(),
          getComplaintStats(),
          getPaymentStats(),
          getOwnershipStats(),
        ]);

        setStats({
          residents: {
            totalResidents: residentStats.totalResidents,
            activeResidents: residentStats.activeResidents,
            inactiveResidents: residentStats.inactiveResidents,
          },
          payments: {
            totalRevenue: paymentStats.totalRevenue,
            outstandingAmount: paymentStats.outstandingAmount,
            collectionRate: paymentStats.collectionRate,
            overdueAmount: paymentStats.overdueAmount,
            outstandingCount: paymentStats.outstandingCount,
            overdueCount: paymentStats.overdueCount,
          },
          moveRequests: {
            pendingRequests: moveRequestStats.pendingRequests,
          },
          complaints: {
            openComplaints: complaintStats.openComplaints,
          },
          ownership: {
            totalOwnedUnits: ownershipStats.totalOwnedUnits,
            ownerOccupied: ownershipStats.ownerOccupied,
            investmentProperties: ownershipStats.investmentProperties,
          },
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your condo management system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Residents
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.residents.totalResidents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "..."
                  : `${stats?.residents.activeResidents || 0} active`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue This Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "..."
                  : `$${stats?.payments.totalRevenue.toLocaleString() || 0}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "..."
                  : `${
                      stats?.payments.outstandingCount || 0
                    } outstanding payments`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.moveRequests.pendingRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires your attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Complaints
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.complaints.openComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">Needs resolution</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="amenities">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="amenities">Amenity Bookings</TabsTrigger>
            <TabsTrigger value="move">Move Requests</TabsTrigger>
            <TabsTrigger value="gatepass">Gatepass</TabsTrigger>
          </TabsList>
          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Amenity Bookings</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Loading..."
                    : `You have ${
                        stats?.moveRequests.pendingRequests || 0
                      } pending amenity booking requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Amenity</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-muted-foreground"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-muted-foreground"
                          >
                            No recent bookings
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/amenities">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="move" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Move Requests</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Loading..."
                    : `You have ${
                        stats?.moveRequests.pendingRequests || 0
                      } pending move requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 text-center text-muted-foreground"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 text-center text-muted-foreground"
                          >
                            No recent move requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/move-requests">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="gatepass" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gatepass Requests</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Loading..."
                    : `You have ${
                        stats?.moveRequests.pendingRequests || 0
                      } pending gatepass requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Visitors</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-muted-foreground"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-muted-foreground"
                          >
                            No recent gatepass requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/gatepass">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Units Overview</CardTitle>
              <CardDescription>
                Current occupancy and unit status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Units</p>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : stats?.ownership.totalOwnedUnits || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Owner-Occupied</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? "..." : stats?.ownership.ownerOccupied || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Investment</p>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : stats?.ownership.investmentProperties || 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">North Block</p>
                    <p>
                      {isLoading
                        ? "..."
                        : `${
                            stats?.ownership.ownerOccupied || 0
                          } units occupied`}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: isLoading
                          ? "0%"
                          : `${
                              ((stats?.ownership.ownerOccupied || 0) /
                                (stats?.ownership.totalOwnedUnits || 1)) *
                              100
                            }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">South Block</p>
                    <p>
                      {isLoading
                        ? "..."
                        : `${
                            stats?.ownership.investmentProperties || 0
                          } units occupied`}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: isLoading
                          ? "0%"
                          : `${
                              ((stats?.ownership.investmentProperties || 0) /
                                (stats?.ownership.totalOwnedUnits || 1)) *
                              100
                            }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href="/admin/units">
                  View All Units
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
              <CardDescription>Monthly dues and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Due</p>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : `$${(
                            (stats?.payments?.totalRevenue || 0) +
                            (stats?.payments?.outstandingAmount || 0)
                          ).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Collected</p>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : `$${
                            stats?.payments.totalRevenue.toLocaleString() || 0
                          }`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Outstanding</p>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : `$${
                            stats?.payments.outstandingAmount.toLocaleString() ||
                            0
                          }`}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Collection Rate</p>
                    <p>
                      {isLoading
                        ? "..."
                        : `${stats?.payments.collectionRate || 0}%`}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: isLoading
                          ? "0%"
                          : `${stats?.payments.collectionRate || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Overdue Payments</p>
                    <p>
                      {isLoading
                        ? "..."
                        : `$${
                            stats?.payments.overdueAmount.toLocaleString() || 0
                          }`}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-destructive"
                      style={{
                        width: isLoading
                          ? "0%"
                          : `${
                              ((stats?.payments.overdueAmount || 0) /
                                (stats?.payments.outstandingAmount || 1)) *
                              100
                            }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href="/admin/payments">
                  View All Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
