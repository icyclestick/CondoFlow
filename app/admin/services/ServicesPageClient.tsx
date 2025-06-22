"use client";

import { useEffect, useState } from "react";
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
import { Search, Wrench, Clock, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllServiceRequests,
  getServiceRequestStats,
  updateServiceRequestStatus,
  assignServiceRequest,
} from "@/lib/actions";

interface ServiceRequest {
  id: string;
  service_type: string;
  description: string;
  urgency: string;
  status: string;
  preferred_schedule: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface ServiceStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  emergencyRequests: number;
}

export default function AdminServicesPage({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllServiceRequests(),
        getServiceRequestStats(),
      ]);

      setRequests(
        requestsData.map((request: any) => ({
          ...request,
          profiles: request.profiles || {
            full_name: "Unknown",
            email: "",
            phone: null,
          },
        }))
      );
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (requestId: string, technician: string) => {
    try {
      await assignServiceRequest(requestId, technician);
      toast({
        title: "Technician Assigned",
        description: `Service request has been assigned to ${technician}.`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to assign technician.",
        variant: "destructive",
      });
    }
  };

  const handleMarkResolved = async (requestId: string) => {
    try {
      await updateServiceRequestStatus(requestId, "completed");
      toast({
        title: "Request Resolved",
        description: "The service request has been marked as resolved.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to mark request as resolved.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      !searchTerm ||
      (request.profiles?.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesUrgency =
      !selectedUrgency || request.urgency === selectedUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout
        userRole={userRole as "admin" | "resident"}
        userName={userName}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading services data...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Service Management
            </h1>
            <p className="text-muted-foreground">
              Manage maintenance and service requests
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting assignment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.inProgressRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.emergencyRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Urgent attention needed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search service requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Urgency</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>
                  All maintenance and service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request ID</th>
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Service Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Assigned To</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No service requests found
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3 font-medium">
                              {request.id.slice(0, 8)}
                            </td>
                            <td className="py-3">
                              {request.profiles?.full_name || "Unknown"}
                            </td>
                            <td className="py-3">{request.service_type}</td>
                            <td className="py-3">
                              {formatDate(request.created_at)}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.urgency === "emergency"
                                    ? "destructive"
                                    : request.urgency === "high"
                                    ? "destructive"
                                    : request.urgency === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.urgency}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.status === "completed"
                                    ? "default"
                                    : request.status === "in-progress" ||
                                      request.status === "assigned"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              {request.assigned_to || "-"}
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                                {request.status === "pending" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleAssign(
                                        request.id,
                                        "Available Technician"
                                      )
                                    }
                                  >
                                    Assign
                                  </Button>
                                )}
                                {(request.status === "in-progress" ||
                                  request.status === "assigned") && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleMarkResolved(request.id)
                                    }
                                  >
                                    Mark Resolved
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
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Service requests awaiting assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Service Type</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests
                        .filter((r) => r.status === "pending")
                        .map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3">
                              {request.profiles?.full_name || "Unknown"}
                            </td>
                            <td className="py-3">{request.service_type}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.urgency === "emergency"
                                    ? "destructive"
                                    : request.urgency === "high"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {request.urgency}
                              </Badge>
                            </td>
                            <td className="py-3 max-w-xs truncate">
                              {request.description}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAssign(
                                    request.id,
                                    "Available Technician"
                                  )
                                }
                              >
                                Assign
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Requests</CardTitle>
                <CardDescription>
                  Urgent service requests requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Service Type</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests
                        .filter((r) => r.urgency === "emergency")
                        .map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3">
                              {request.profiles?.full_name || "Unknown"}
                            </td>
                            <td className="py-3">{request.service_type}</td>
                            <td className="py-3 max-w-xs truncate">
                              {request.description}
                            </td>
                            <td className="py-3">
                              <Badge variant="destructive">
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              {request.status === "pending" ? (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAssign(
                                      request.id,
                                      "Emergency Technician"
                                    )
                                  }
                                >
                                  Assign Now
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkResolved(request.id)}
                                >
                                  Mark Resolved
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
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
