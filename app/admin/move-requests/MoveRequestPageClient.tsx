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
import { Search, Truck, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllMoveRequests,
  getMoveRequestStats,
  updateMoveRequestStatus,
  approveMoveRequest,
  rejectMoveRequest,
} from "@/lib/actions";

interface MoveRequest {
  id: string;
  type: string;
  move_date: string;
  time_slot: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  units: {
    id: string;
    block: string;
    unit_number: string;
  };
}

interface MoveRequestStats {
  totalRequests: number;
  pendingRequests: number;
  moveIns: number;
  moveOuts: number;
}

export default function AdminMoveRequestsPage({userName, userRole}: {userName: string, userRole: "admin" | "resident"}) {
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [stats, setStats] = useState<MoveRequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllMoveRequests(),
        getMoveRequestStats(),
      ]);

      setRequests(requestsData);
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

  const handleApprove = async (requestId: string) => {
    try {
      await approveMoveRequest(requestId);
      toast({
        title: "Request Approved",
        description: "The move request has been approved successfully.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve request.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMoveRequest(requestId);
      toast({
        title: "Request Rejected",
        description: "The move request has been rejected.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject request.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await updateMoveRequestStatus(requestId, "completed");
      toast({
        title: "Request Completed",
        description: "The move request has been marked as completed.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete request.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      !searchTerm ||
      request.profiles.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${request.units.block}-${request.units.unit_number}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesType = !selectedType || request.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">
            Loading move requests data...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Move Requests</h1>
            <p className="text-muted-foreground">
              Manage resident move-in and move-out requests
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Move-ins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.moveIns || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Move-outs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.moveOuts || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Types</option>
            <option value="move-in">Move-in</option>
            <option value="move-out">Move-out</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Move Requests</CardTitle>
                <CardDescription>
                  All move-in and move-out requests
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
                        <th className="pb-2">Move Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No move requests found
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3">
                              {request.profiles.full_name}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.type === "move-in"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.type === "move-in"
                                  ? "Move-in"
                                  : "Move-out"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              Block {request.units.block}, #
                              {request.units.unit_number}
                            </td>
                            <td className="py-3">
                              {formatDate(request.move_date)}
                            </td>
                            <td className="py-3">{request.time_slot}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.status === "approved"
                                    ? "default"
                                    : request.status === "completed"
                                    ? "secondary"
                                    : request.status === "pending"
                                    ? "outline"
                                    : "destructive"
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
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(request.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(request.id)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === "approved" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleComplete(request.id)}
                                  >
                                    Mark Completed
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
                  Requests awaiting your approval
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
                        <th className="pb-2">Move Date</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests
                        .filter((r) => r.status === "pending")
                        .map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3">
                              {request.profiles.full_name}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.type === "move-in"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.type === "move-in"
                                  ? "Move-in"
                                  : "Move-out"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              Block {request.units.block}, #
                              {request.units.unit_number}
                            </td>
                            <td className="py-3">
                              {formatDate(request.move_date)}
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>
                  Requests that have been approved
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
                        <th className="pb-2">Move Date</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests
                        .filter((r) => r.status === "approved")
                        .map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-3">
                              {request.profiles.full_name}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  request.type === "move-in"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.type === "move-in"
                                  ? "Move-in"
                                  : "Move-out"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              Block {request.units.block}, #
                              {request.units.unit_number}
                            </td>
                            <td className="py-3">
                              {formatDate(request.move_date)}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                onClick={() => handleComplete(request.id)}
                              >
                                Mark Completed
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
