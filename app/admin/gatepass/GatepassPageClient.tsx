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
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllGatepassRequests,
  getGatepassStats,
  updateGatepassStatus,
  approveGatepassRequest,
  rejectGatepassRequest,
} from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GatepassRequest {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  purpose: string;
  visit_date: string;
  time_slot: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface GatepassStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
}

export default function AdminGatepassPage({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [requests, setRequests] = useState<GatepassRequest[]>([]);
  const [stats, setStats] = useState<GatepassStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const { toast } = useToast();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<GatepassRequest | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllGatepassRequests(),
        getGatepassStats(),
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
      await approveGatepassRequest(requestId);
      toast({
        title: "Request Approved",
        description: "The gatepass request has been approved successfully.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectGatepassRequest(requestId);
      toast({
        title: "Request Rejected",
        description: "The gatepass request has been rejected.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await updateGatepassStatus(requestId, "completed");
      toast({
        title: "Request Completed",
        description: "The gatepass request has been marked as completed.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to complete request",
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
      request.visitor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || request.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: GatepassRequest) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
  };

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gatepass Requests
          </h1>
          <p className="text-muted-foreground">
            Review and manage visitor gatepass requests
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.approvedRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.completedRequests || 0}
              </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Gatepass Requests</CardTitle>
            <CardDescription>
              Review and manage visitor gatepass requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-2">Resident</th>
                    <th className="pb-2">Visitor</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading requests...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">
                              {request.profiles.full_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.profiles.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">
                              {request.visitor_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.visitor_phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{request.purpose}</td>
                        <td className="py-3">
                          {new Date(request.visit_date).toLocaleDateString()}
                        </td>
                        <td className="py-3">{request.time_slot}</td>
                        <td className="py-3">
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "pending"
                                ? "outline"
                                : request.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewRequest(request)}
                            >
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
                                variant="secondary"
                                onClick={() => handleComplete(request.id)}
                              >
                                Complete
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
      </div>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gatepass Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Resident Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profiles.full_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resident Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profiles.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resident Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profiles.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visitor Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.visitor_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visitor Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.visitor_phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedRequest.status === "approved"
                          ? "default"
                          : selectedRequest.status === "pending"
                          ? "outline"
                          : selectedRequest.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visit Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.visit_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time Slot</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.time_slot}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Purpose</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.purpose}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedRequest.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeViewModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
