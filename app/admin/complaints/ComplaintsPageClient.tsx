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
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,
  respondToComplaint,
} from "@/lib/actions";

interface Complaint {
  id: string;
  type: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_response: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface ComplaintStats {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
}

export default function ComplaintsPageClient({userName, userRole}: {userName: string, userRole: "admin" | "resident"}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
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
      const [complaintsData, statsData] = await Promise.all([
        getAllComplaints(),
        getComplaintStats(),
      ]);

      setComplaints(complaintsData);
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

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast({
        title: "Status Updated",
        description: `Complaint status has been updated to ${newStatus}.`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update complaint status.",
        variant: "destructive",
      });
    }
  };

  const handleRespond = async (complaintId: string, response: string) => {
    try {
      await respondToComplaint(complaintId, response);
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the resident.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      !searchTerm ||
      complaint.profiles.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus || complaint.status === selectedStatus;
    const matchesType = !selectedType || complaint.type === selectedType;

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
            Loading complaints data...
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
            <h1 className="text-3xl font-bold tracking-tight">
              Complaint Management
            </h1>
            <p className="text-muted-foreground">
              Manage and respond to resident complaints
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Complaints
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.openComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.inProgressComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">Being addressed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.resolvedComplaints || 0}
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
              placeholder="Search complaints..."
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
            <option value="noise">Noise Complaint</option>
            <option value="maintenance">Maintenance Issue</option>
            <option value="security">Security Concern</option>
            <option value="neighbor">Neighbor Dispute</option>
            <option value="common-area">Common Area Issue</option>
            <option value="other">Other</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Complaints</CardTitle>
                <CardDescription>
                  Manage all resident complaints and issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Last Update</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No complaints found
                          </td>
                        </tr>
                      ) : (
                        filteredComplaints.map((complaint) => (
                          <tr key={complaint.id} className="border-b">
                            <td className="py-3 font-medium">
                              {complaint.id.slice(0, 8)}
                            </td>
                            <td className="py-3">
                              {complaint.profiles.full_name}
                            </td>
                            <td className="py-3">{complaint.type}</td>
                            <td className="py-3">
                              {formatDate(complaint.created_at)}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  complaint.urgency === "high"
                                    ? "destructive"
                                    : complaint.urgency === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {complaint.urgency}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  complaint.status === "resolved"
                                    ? "default"
                                    : complaint.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {complaint.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              {formatDate(complaint.updated_at)}
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  Reply
                                </Button>
                                {complaint.status !== "resolved" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint.id,
                                        "resolved"
                                      )
                                    }
                                  >
                                    Resolve
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
          <TabsContent value="open" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Complaints</CardTitle>
                <CardDescription>
                  Complaints that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints
                        .filter((c) => c.status === "pending")
                        .map((complaint) => (
                          <tr key={complaint.id} className="border-b">
                            <td className="py-3">
                              {complaint.profiles.full_name}
                            </td>
                            <td className="py-3">{complaint.type}</td>
                            <td className="py-3 max-w-xs truncate">
                              {complaint.description}
                            </td>
                            <td className="py-3">
                              {formatDate(complaint.created_at)}
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      complaint.id,
                                      "in-progress"
                                    )
                                  }
                                >
                                  Mark In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRespond(
                                      complaint.id,
                                      "We are looking into this issue."
                                    )
                                  }
                                >
                                  Send Response
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
          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Complaints</CardTitle>
                <CardDescription>
                  High priority complaints requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints
                        .filter((c) => c.urgency === "high")
                        .map((complaint) => (
                          <tr key={complaint.id} className="border-b">
                            <td className="py-3">
                              {complaint.profiles.full_name}
                            </td>
                            <td className="py-3">{complaint.type}</td>
                            <td className="py-3 max-w-xs truncate">
                              {complaint.description}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  complaint.status === "resolved"
                                    ? "default"
                                    : complaint.status === "in-progress"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {complaint.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                {complaint.status === "pending" ? (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint.id,
                                        "in-progress"
                                      )
                                    }
                                  >
                                    Handle Now
                                  </Button>
                                ) : complaint.status === "in-progress" ? (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint.id,
                                        "resolved"
                                      )
                                    }
                                  >
                                    Mark Resolved
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    View Details
                                  </Button>
                                )}
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
