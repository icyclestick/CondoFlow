"use client";
import { useToast } from "@/components/ui/use-toast";
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
import {
  ArrowRight,
  Calendar,
  DollarSign,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface AmenityBooking {
  id: string;
  resident: string;
  amenity: string;
  date: string;
  status: string;
}
interface MoveRequest {
  id: string;
  resident: string;
  type: string;
  unit: string;
  date: string;
  status: string;
}
interface GatepassRequest {
  id: string;
  resident: string;
  items: string;
  date: string;
  status: string;
}

interface AdminDashboardClientProps {
  stats: any;
  amenityBookings: AmenityBooking[];
  moveRequests: MoveRequest[];
  gatepassRequests: GatepassRequest[];
}

export default function AdminDashboardClient({
  stats,
  amenityBookings,
  moveRequests,
  gatepassRequests,
}: AdminDashboardClientProps) {
  const { toast } = useToast();
  // You can add client-side logic here if needed

  return (
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
              {stats.residents.totalResidents}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.residents.activeResidents} active
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
              ${stats.payments.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.payments.outstandingCount} outstanding payments
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
              {stats.moveRequests.pendingRequests}
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
              {stats.complaints.openComplaints}
            </div>
            <p className="text-xs text-muted-foreground">-2 from last week</p>
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
                {amenityBookings.length > 0
                  ? `You have ${
                      amenityBookings.filter((b) => b.status === "Pending")
                        .length
                    } pending amenity booking requests`
                  : "No amenity bookings found"}
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
                    {amenityBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-3 text-center text-muted-foreground"
                        >
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      amenityBookings.map((booking) => (
                        <tr key={booking.id} className="border-b">
                          <td className="py-3">{booking.resident}</td>
                          <td className="py-3">{booking.amenity}</td>
                          <td className="py-3">{booking.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                booking.status === "Pending"
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {booking.status === "Pending" && (
                                <Button size="sm">Approve</Button>
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
                {moveRequests.length > 0
                  ? `You have ${
                      moveRequests.filter((r) => r.status === "Pending").length
                    } pending move requests`
                  : "No move requests found"}
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
                    {moveRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-3 text-center text-muted-foreground"
                        >
                          No move requests found
                        </td>
                      </tr>
                    ) : (
                      moveRequests.map((request) => (
                        <tr key={request.id} className="border-b">
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.type}</td>
                          <td className="py-3">{request.unit}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Pending"
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && (
                                <Button size="sm">Approve</Button>
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
                {gatepassRequests.length > 0
                  ? `You have ${
                      gatepassRequests.filter((r) => r.status === "Pending")
                        .length
                    } pending gatepass requests`
                  : "No gatepass requests found"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-2">Resident</th>
                      <th className="pb-2">Items</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatepassRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-3 text-center text-muted-foreground"
                        >
                          No gatepass requests found
                        </td>
                      </tr>
                    ) : (
                      gatepassRequests.map((request) => (
                        <tr key={request.id} className="border-b">
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.items}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Pending"
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && (
                                <Button size="sm">Approve</Button>
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
            <CardDescription>Current occupancy and unit status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Units</p>
                  <p className="text-2xl font-bold">
                    {stats.ownership.totalOwnedUnits}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Owner Occupied</p>
                  <p className="text-2xl font-bold">
                    {stats.ownership.ownerOccupied}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Investment</p>
                  <p className="text-2xl font-bold">
                    {stats.ownership.investmentProperties}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Block A</p>
                  <p>48/50 units occupied</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "96%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Block B</p>
                  <p>45/50 units occupied</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Block C</p>
                  <p>42/50 units occupied</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "84%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Block D</p>
                  <p>43/50 units occupied</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "86%" }}
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
                    $
                    {stats.payments.totalRevenue +
                      stats.payments.outstandingAmount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Collected</p>
                  <p className="text-2xl font-bold">
                    ${stats.payments.totalRevenue}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Outstanding</p>
                  <p className="text-2xl font-bold">
                    ${stats.payments.outstandingAmount}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Association Dues</p>
                  <p>$18,200 / $20,000</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "91%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Utility Fees</p>
                  <p>$6,250 / $8,200</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "76%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Parking Fees</p>
                  <p>$4,000 / $7,000</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "57%" }}
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
  );
}
