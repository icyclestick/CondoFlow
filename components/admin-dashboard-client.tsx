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
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  approveBooking,
  rejectBooking,
  approveMoveRequest,
  rejectMoveRequest,
  approveGatepassRequest,
  rejectGatepassRequest,
} from "@/lib/actions";

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
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject";
    requestType: "amenity" | "move" | "gatepass";
    requestId: string;
    requestName: string;
  }>({
    isOpen: false,
    type: "approve",
    requestType: "amenity",
    requestId: "",
    requestName: "",
  });

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const { type, requestType, requestId } = confirmDialog;

      switch (requestType) {
        case "amenity":
          if (type === "approve") {
            await approveBooking(requestId);
          } else {
            await rejectBooking(requestId);
          }
          break;
        case "move":
          if (type === "approve") {
            await approveMoveRequest(requestId);
          } else {
            await rejectMoveRequest(requestId);
          }
          break;
        case "gatepass":
          if (type === "approve") {
            await approveGatepassRequest(requestId);
          } else {
            await rejectGatepassRequest(requestId);
          }
          break;
      }

      toast({
        title: `Request ${type === "approve" ? "Approved" : "Rejected"}`,
        description: `The ${requestType} request has been ${
          type === "approve" ? "approved" : "rejected"
        } successfully.`,
      });

      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const openConfirmDialog = (
    type: "approve" | "reject",
    requestType: "amenity" | "move" | "gatepass",
    requestId: string,
    requestName: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      type,
      requestType,
      requestId,
      requestName,
    });
  };

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
                                  : booking.status === "Approved"
                                  ? "default"
                                  : booking.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/admin/amenities">View</Link>
                              </Button>
                              {booking.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "approve",
                                        "amenity",
                                        booking.id,
                                        `${booking.resident} - ${booking.amenity}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "reject",
                                        "amenity",
                                        booking.id,
                                        `${booking.resident} - ${booking.amenity}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
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
                                  : request.status === "Approved"
                                  ? "default"
                                  : request.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/admin/move-requests">View</Link>
                              </Button>
                              {request.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "approve",
                                        "move",
                                        request.id,
                                        `${request.resident} - ${request.type}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "reject",
                                        "move",
                                        request.id,
                                        `${request.resident} - ${request.type}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
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
                                  : request.status === "Approved"
                                  ? "default"
                                  : request.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/admin/gatepass">View</Link>
                              </Button>
                              {request.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "approve",
                                        "gatepass",
                                        request.id,
                                        `${request.resident} - ${request.items}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      openConfirmDialog(
                                        "reject",
                                        "gatepass",
                                        request.id,
                                        `${request.resident} - ${request.items}`
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
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

      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, isOpen: open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "approve" ? "Approve" : "Reject"} Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.type} the request for{" "}
              <strong>{confirmDialog.requestName}</strong>?
              {confirmDialog.type === "reject" &&
                " This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isLoading}
              className={
                confirmDialog.type === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {isLoading
                ? "Processing..."
                : confirmDialog.type === "approve"
                ? "Approve"
                : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
