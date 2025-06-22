"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  Truck,
  UserPlus,
  Wrench,
} from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getMyProfile,
  getMyUnitInfo,
} from "@/lib/actions/resident/resident-profile";
import { getMyPayments } from "@/lib/actions/resident/resident-payments";
import { getMyServiceRequests } from "@/lib/actions/resident/services";
import { getMyVisitorRequests } from "@/lib/actions/resident/resident-visitors";
import { getMyComplaints } from "@/lib/actions/resident/resident-complaints";
import { getMyMoveRequests } from "@/lib/actions/resident/resident-move-requests";
import { getMyAmenityStats } from "@/lib/actions/resident/resident-amenities";
import { getMyAmenityBookings } from "@/lib/actions/resident/resident-amenities";

export default function ResidentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          profile,
          unitInfo,
          payments,
          serviceRequests,
          visitorRequests,
          complaints,
          moveRequests,
          amenityStats,
          amenityBookings,
        ] = await Promise.all([
          getMyProfile(),
          getMyUnitInfo(),
          getMyPayments(),
          getMyServiceRequests(),
          getMyVisitorRequests(),
          getMyComplaints(),
          getMyMoveRequests(),
          getMyAmenityStats(),
          getMyAmenityBookings(),
        ]);

        setData({
          profile,
          unitInfo,
          payments,
          serviceRequests,
          visitorRequests,
          complaints,
          moveRequests,
          amenityStats,
          amenityBookings,
        });
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userRole="resident" userName="Resident">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="resident" userName="Resident">
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const {
    profile,
    unitInfo,
    payments,
    serviceRequests,
    visitorRequests,
    complaints,
    moveRequests,
    amenityStats,
    amenityBookings,
  } = data;

  // Get next upcoming amenity booking
  const now = new Date();
  const nextBooking =
    (amenityBookings as any[])
      ?.filter(
        (b) => new Date(b.booking_date) >= now && b.status !== "cancelled"
      )
      .sort(
        (a, b) =>
          new Date(a.booking_date).getTime() -
          new Date(b.booking_date).getTime()
      )[0] || null;

  // Example: Get next payment due
  const nextPayment =
    payments?.find((p: any) => p.status === "pending") || null;

  // Example: Pending requests count
  const pendingRequestsCount = [
    ...(serviceRequests?.filter((r: any) => r.status === "pending") || []),
    ...(moveRequests?.filter((r: any) => r.status === "pending") || []),
    ...(complaints?.filter((r: any) => r.status === "pending") || []),
    ...(visitorRequests?.filter((r: any) => r.status === "pending") || []),
  ].length;

  // Example: Requests table (combine from different sources)
  const requestsTable = [
    ...(serviceRequests?.map((r: any) => ({
      type: "Service Request",
      description: r.service_type,
      date: r.created_at?.slice(0, 10),
      status: r.status,
    })) || []),
    ...(moveRequests?.map((r: any) => ({
      type: "Move Request",
      description: r.type,
      date: r.move_date,
      status: r.status,
    })) || []),
    ...(visitorRequests?.map((r: any) => ({
      type: "Visitor Pass",
      description: r.visitor_name,
      date: r.visit_date,
      status: r.status,
    })) || []),
    ...(complaints?.map((r: any) => ({
      type: "Complaint",
      description: r.description,
      date: r.created_at?.slice(0, 10),
      status: r.status,
    })) || []),
  ];

  return (
    <MainLayout
      userRole={profile?.role || "resident"}
      userName={profile?.full_name || "Resident"}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || "Resident"}
          </h1>
          <p className="text-muted-foreground">
            {(() => {
              const pu = unitInfo?.primaryUnit;
              if (
                Array.isArray(pu) &&
                pu.length > 0 &&
                typeof pu[0] === "object" &&
                pu[0] !== null &&
                "block" in pu[0] &&
                "unit_number" in pu[0]
              ) {
                return `Here's what's happening with your unit: Block ${
                  (pu[0] as any).block
                }, Unit ${(pu[0] as any).unit_number}`;
              } else if (
                pu &&
                typeof pu === "object" &&
                !Array.isArray(pu) &&
                "block" in pu &&
                "unit_number" in pu
              ) {
                return `Here's what's happening with your unit: Block ${
                  (pu as any).block
                }, Unit ${(pu as any).unit_number}`;
              } else {
                return "Here's what's happening with your unit";
              }
            })()}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Booking
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextBooking
                  ? nextBooking.amenities.name
                  : "No upcoming booking"}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextBooking
                  ? `${nextBooking.booking_date} • ${nextBooking.time_slot}`
                  : "-"}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resident/amenities">View All Bookings</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Due</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextPayment ? `$${nextPayment.amount}` : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextPayment
                  ? `Due on ${nextPayment.due_date}`
                  : "No payment due"}
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" asChild>
                <Link href="/resident/payments">Pay Now</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequestsCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resident/requests">View Requests</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                  asChild
                >
                  <Link href="/resident/amenities">
                    <Calendar className="h-6 w-6" />
                    <span>Book Amenity</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                  asChild
                >
                  <Link href="/resident/move-requests">
                    <Truck className="h-6 w-6" />
                    <span>Submit Move Request</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                  asChild
                >
                  <Link href="/resident/visitors">
                    <UserPlus className="h-6 w-6" />
                    <span>Add Visitor</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                  asChild
                >
                  <Link href="/resident/complaints">
                    <MessageSquare className="h-6 w-6" />
                    <span>File Complaint</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>Status of your recent requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsTable.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 text-center text-muted-foreground"
                      >
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    requestsTable.slice(0, 5).map((request, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">{request.type}</td>
                        <td className="py-3 max-w-xs truncate">
                          {request.description}
                        </td>
                        <td className="py-3">{request.date}</td>
                        <td className="py-3">
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "in-progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/resident/requests">View Details</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <Link href="/resident/requests">
                View All Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
