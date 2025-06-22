"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAllVisitorRequests,
  approveVisitorRequest,
  rejectVisitorRequest,
  updateVisitorRequest,
  deleteVisitorRequest,
} from "@/lib/actions/admin/visitors";

export default function VisitorsPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const { toast } = useToast();
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewVisitor, setViewVisitor] = useState<any | null>(null);
  const [editingVisitor, setEditingVisitor] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllVisitorRequests()
      .then(setVisitorRequests)
      .catch((err) =>
        setError(err.message || "Failed to load visitor requests")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setIsApproving(id);
    setError("");
    try {
      await approveVisitorRequest(id);
      setVisitorRequests(await getAllVisitorRequests());
      toast({
        title: "Visitor Approved",
        description: "Visitor request has been approved successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to approve visitor request.");
      toast({
        title: "Error",
        description: err.message || "Failed to approve visitor request",
        variant: "destructive",
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsRejecting(id);
    setError("");
    try {
      await rejectVisitorRequest(id);
      setVisitorRequests(await getAllVisitorRequests());
      toast({
        title: "Visitor Rejected",
        description: "Visitor request has been rejected successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to reject visitor request.");
      toast({
        title: "Error",
        description: err.message || "Failed to reject visitor request",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(null);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor) return;

    setIsEditing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("visitorName", editingVisitor.visitor_name);
      formData.append("visitDate", editingVisitor.visit_date);
      formData.append("timeIn", editingVisitor.time_in);
      formData.append("reason", editingVisitor.reason);
      formData.append("vehicleInfo", editingVisitor.vehicle_info || "");

      await updateVisitorRequest(editingVisitor.id, formData);

      setVisitorRequests(await getAllVisitorRequests());
      setEditingVisitor(null);
      toast({
        title: "Visitor Updated",
        description: "Visitor request has been updated successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update visitor request.");
      toast({
        title: "Error",
        description: err.message || "Failed to update visitor request",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor request?")) {
      return;
    }

    try {
      await deleteVisitorRequest(id);
      setVisitorRequests(await getAllVisitorRequests());
      toast({
        title: "Visitor Deleted",
        description: "Visitor request has been deleted successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete visitor request.");
      toast({
        title: "Error",
        description: err.message || "Failed to delete visitor request",
        variant: "destructive",
      });
    }
  };

  // Filter requests by status
  const pendingRequests = visitorRequests.filter(
    (v: any) => v.status === "pending"
  );
  const approvedRequests = visitorRequests.filter(
    (v: any) => v.status === "approved"
  );
  const checkedInRequests = visitorRequests.filter(
    (v: any) => v.status === "checked-in"
  );
  const checkedOutRequests = visitorRequests.filter(
    (v: any) => v.status === "checked-out"
  );
  const cancelledRequests = visitorRequests.filter(
    (v: any) => v.status === "cancelled"
  );

  const renderVisitorTable = (requests: any[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {requests.length} visitor request{requests.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No {title.toLowerCase()} requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-2">Resident</th>
                  <th className="pb-2">Visitor Name</th>
                  <th className="pb-2">Visit Date</th>
                  <th className="pb-2">Time In</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((visitor) => (
                  <tr key={visitor.id} className="border-b">
                    <td className="py-3">
                      {visitor.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="py-3">{visitor.visitor_name}</td>
                    <td className="py-3">{visitor.visit_date}</td>
                    <td className="py-3">{visitor.time_in}</td>
                    <td className="py-3 max-w-xs truncate">{visitor.reason}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          visitor.status === "checked-out"
                            ? "secondary"
                            : visitor.status === "checked-in"
                            ? "default"
                            : visitor.status === "approved"
                            ? "outline"
                            : visitor.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {visitor.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewVisitor(visitor)}
                        >
                          View
                        </Button>
                        {visitor.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingVisitor(visitor)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(visitor.id)}
                              disabled={isApproving === visitor.id}
                            >
                              {isApproving === visitor.id
                                ? "Approving..."
                                : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(visitor.id)}
                              disabled={isRejecting === visitor.id}
                            >
                              {isRejecting === visitor.id
                                ? "Rejecting..."
                                : "Reject"}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(visitor.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visitor Management
          </h1>
          <p className="text-muted-foreground">
            Manage and approve visitor requests from residents
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="checked-in">
              Checked In ({checkedInRequests.length})
            </TabsTrigger>
            <TabsTrigger value="checked-out">
              Checked Out ({checkedOutRequests.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              renderVisitorTable(pendingRequests, "Pending Requests")
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              renderVisitorTable(approvedRequests, "Approved Requests")
            )}
          </TabsContent>

          <TabsContent value="checked-in" className="space-y-6">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              renderVisitorTable(checkedInRequests, "Checked In Visitors")
            )}
          </TabsContent>

          <TabsContent value="checked-out" className="space-y-6">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              renderVisitorTable(checkedOutRequests, "Checked Out Visitors")
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              renderVisitorTable(cancelledRequests, "Cancelled Requests")
            )}
          </TabsContent>
        </Tabs>

        {/* View Visitor Modal */}
        <Dialog open={!!viewVisitor} onOpenChange={() => setViewVisitor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visitor Details</DialogTitle>
            </DialogHeader>
            {viewVisitor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Resident</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.profiles?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Visitor Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.visitor_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Visit Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.visit_date}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time In</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.time_in}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time Out</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.time_out || "Not checked out yet"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reason</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.reason}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          viewVisitor.status === "checked-out"
                            ? "secondary"
                            : viewVisitor.status === "checked-in"
                            ? "default"
                            : viewVisitor.status === "approved"
                            ? "outline"
                            : viewVisitor.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {viewVisitor.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {viewVisitor.vehicle_info && (
                  <div>
                    <Label className="text-sm font-medium">
                      Vehicle Information
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {viewVisitor.vehicle_info}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewVisitor.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewVisitor(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Visitor Modal */}
        <Dialog
          open={!!editingVisitor}
          onOpenChange={() => setEditingVisitor(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Visitor Request</DialogTitle>
            </DialogHeader>
            {editingVisitor && (
              <form onSubmit={handleEdit} className="space-y-6">
                {error && <div className="text-red-600">{error}</div>}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-visitor-name">Visitor Name</Label>
                    <input
                      id="edit-visitor-name"
                      name="visitorName"
                      type="text"
                      required
                      value={editingVisitor.visitor_name}
                      onChange={(e) =>
                        setEditingVisitor({
                          ...editingVisitor,
                          visitor_name: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter visitor's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-visit-date">Visit Date</Label>
                    <input
                      id="edit-visit-date"
                      name="visitDate"
                      type="date"
                      required
                      value={editingVisitor.visit_date}
                      onChange={(e) =>
                        setEditingVisitor({
                          ...editingVisitor,
                          visit_date: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-time-in">Expected Time In</Label>
                  <input
                    id="edit-time-in"
                    name="timeIn"
                    type="time"
                    required
                    value={editingVisitor.time_in}
                    onChange={(e) =>
                      setEditingVisitor({
                        ...editingVisitor,
                        time_in: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-reason">Reason for Visit</Label>
                  <select
                    id="edit-reason"
                    name="reason"
                    required
                    value={editingVisitor.reason}
                    onChange={(e) =>
                      setEditingVisitor({
                        ...editingVisitor,
                        reason: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="personal">Personal Visit</option>
                    <option value="business">Business Meeting</option>
                    <option value="delivery">Delivery/Service</option>
                    <option value="maintenance">Maintenance Work</option>
                    <option value="family">Family Visit</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle-info">
                    Vehicle Information (Optional)
                  </Label>
                  <input
                    id="edit-vehicle-info"
                    name="vehicleInfo"
                    type="text"
                    value={editingVisitor.vehicle_info || ""}
                    onChange={(e) =>
                      setEditingVisitor({
                        ...editingVisitor,
                        vehicle_info: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="License plate number, car model, color"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingVisitor(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditing}>
                    {isEditing ? "Updating..." : "Update Request"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
