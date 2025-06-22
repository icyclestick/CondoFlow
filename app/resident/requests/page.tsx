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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Truck, UserPlus, Wrench, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getMyAmenityBookings } from "@/lib/actions/resident/resident-amenities";
import { getMyMoveRequests } from "@/lib/actions/resident/resident-move-requests";
import { getMyVisitorRequests } from "@/lib/actions/resident/resident-visitors";
import { getMyServiceRequests } from "@/lib/actions/resident/services";
import { getMyComplaints } from "@/lib/actions/resident/resident-complaints";

interface RequestItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
  icon: React.ReactNode;
  link: string;
  details?: any;
}

export default async function ResidentRequestsPage() {
  const [
    amenityBookings,
    moveRequests,
    visitorRequests,
    serviceRequests,
    complaints,
  ] = await Promise.all([
    getMyAmenityBookings(),
    getMyMoveRequests(),
    getMyVisitorRequests(),
    getMyServiceRequests(),
    getMyComplaints(),
  ]);

  // Transform all requests into a unified format
  const allRequests: RequestItem[] = [
    ...(amenityBookings?.map((booking: any) => ({
      id: booking.id,
      type: "Amenity Booking",
      title: booking.amenities?.name || "Amenity Booking",
      description: `${booking.booking_date} at ${booking.time_slot}`,
      date: booking.created_at,
      status: booking.status,
      icon: <Calendar className="h-4 w-4" />,
      link: "/resident/amenities",
      details: booking,
    })) || []),
    ...(moveRequests?.map((request: any) => ({
      id: request.id,
      type: "Move Request",
      title: `${request.type === "move-in" ? "Move In" : "Move Out"}`,
      description: `Scheduled for ${request.move_date}`,
      date: request.created_at,
      status: request.status,
      icon: <Truck className="h-4 w-4" />,
      link: "/resident/move-requests",
      details: request,
    })) || []),
    ...(visitorRequests?.map((request: any) => ({
      id: request.id,
      type: "Visitor Pass",
      title: request.visitor_name,
      description: `Visit on ${request.visit_date}`,
      date: request.created_at,
      status: request.status,
      icon: <UserPlus className="h-4 w-4" />,
      link: "/resident/visitors",
      details: request,
    })) || []),
    ...(serviceRequests?.map((request: any) => ({
      id: request.id,
      type: "Service Request",
      title: request.service_type,
      description: request.description,
      date: request.created_at,
      status: request.status,
      icon: <Wrench className="h-4 w-4" />,
      link: "/resident/services",
      details: request,
    })) || []),
    ...(complaints?.map((complaint: any) => ({
      id: complaint.id,
      type: "Complaint",
      title: complaint.complaint_type,
      description: complaint.description,
      date: complaint.created_at,
      status: complaint.status,
      icon: <MessageSquare className="h-4 w-4" />,
      link: "/resident/complaints",
      details: complaint,
    })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group requests by status
  const pendingRequests = allRequests.filter((r) => r.status === "pending");
  const approvedRequests = allRequests.filter((r) => r.status === "approved");
  const completedRequests = allRequests.filter(
    (r) => r.status === "completed" || r.status === "resolved"
  );
  const rejectedRequests = allRequests.filter((r) => r.status === "rejected");

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "completed":
      case "resolved":
        return "secondary";
      case "rejected":
        return "destructive";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const RequestCard = ({ request }: { request: RequestItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">{request.icon}</div>
            <div>
              <CardTitle className="text-base">{request.title}</CardTitle>
              <CardDescription className="text-sm">
                {request.type}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {request.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(request.date).toLocaleDateString()}
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={request.link}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout userRole="resident" userName="Resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Track all your requests and their current status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allRequests.length}</div>
              <p className="text-xs text-muted-foreground">All requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvedRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">Finished</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Requests ({allRequests.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No requests found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by submitting a new request from the dashboard
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No approved requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No completed requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
