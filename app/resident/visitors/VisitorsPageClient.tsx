"use client";

import type React from "react";

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
  getMyVisitorRequests,
  createVisitorRequest,
  cancelVisitorRequest,
  updateMyVisitorRequest,
  checkOutVisitor,
  checkInVisitor,
} from "@/lib/actions/resident/resident-visitors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function VisitorsPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const { toast } = useToast();
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    visitorName: "",
    visitDate: "",
    timeIn: "",
    reason: "",
    vehicleInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewVisitor, setViewVisitor] = useState<any | null>(null);
  const [editingVisitor, setEditingVisitor] = useState<any | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLoadingHistory(true);
    getMyVisitorRequests()
      .then(setVisitorHistory)
      .catch((err) => setError(err.message || "Failed to load visitor history"))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("visitorName", form.visitorName);
      formData.append("visitDate", form.visitDate);
      formData.append("timeIn", form.timeIn);
      formData.append("reason", form.reason);
      formData.append("vehicleInfo", form.vehicleInfo);
      await createVisitorRequest(formData);
      toast({
        title: "Visitor Registered",
        description: "Your visitor has been registered successfully.",
      });
      setForm({
        visitorName: "",
        visitDate: "",
        timeIn: "",
        reason: "",
        vehicleInfo: "",
      });
      // Refresh visitor history
      getMyVisitorRequests().then(setVisitorHistory);
    } catch (err: any) {
      setError(err.message || "Failed to register visitor");
      toast({
        title: "Error",
        description: err.message || "Failed to register visitor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    setError("");
    try {
      await cancelVisitorRequest(id);
      setVisitorHistory(await getMyVisitorRequests());
      toast({
        title: "Visitor Cancelled",
        description: "Visitor request has been cancelled successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to cancel visitor request.");
      toast({
        title: "Error",
        description: err.message || "Failed to cancel visitor request",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
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

      await updateMyVisitorRequest(editingVisitor.id, formData);

      setVisitorHistory(await getMyVisitorRequests());
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

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutVisitor(id);
      setVisitorHistory(await getMyVisitorRequests());
      toast({
        title: "Visitor Checked Out",
        description: "Visitor has been checked out successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to check out visitor.");
      toast({
        title: "Error",
        description: err.message || "Failed to check out visitor",
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkInVisitor(id);
      setVisitorHistory(await getMyVisitorRequests());
      toast({
        title: "Visitor Checked In",
        description: "Visitor has been checked in successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to check in visitor.");
      toast({
        title: "Error",
        description: err.message || "Failed to check in visitor",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visitor Registration
          </h1>
          <p className="text-muted-foreground">
            Register and manage your visitors
          </p>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">Register Visitor</TabsTrigger>
            <TabsTrigger value="history">Visitor History</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Register New Visitor</CardTitle>
                <CardDescription>
                  Fill out the form to register a visitor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="visitor-name">Visitor Name</Label>
                      <input
                        id="visitor-name"
                        name="visitorName"
                        type="text"
                        required
                        value={form.visitorName}
                        onChange={handleFormChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter visitor's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-date">Visit Date</Label>
                      <input
                        id="visit-date"
                        name="visitDate"
                        type="date"
                        required
                        value={form.visitDate}
                        onChange={handleFormChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="time-in">Expected Time In</Label>
                      <input
                        id="time-in"
                        name="timeIn"
                        type="time"
                        required
                        value={form.timeIn}
                        onChange={handleFormChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <select
                      id="reason"
                      name="reason"
                      required
                      value={form.reason}
                      onChange={handleFormChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select reason</option>
                      <option value="personal">Personal Visit</option>
                      <option value="business">Business Meeting</option>
                      <option value="delivery">Delivery/Service</option>
                      <option value="maintenance">Maintenance Work</option>
                      <option value="family">Family Visit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-info">
                      Vehicle Information (Optional)
                    </Label>
                    <input
                      id="vehicle-info"
                      name="vehicleInfo"
                      type="text"
                      value={form.vehicleInfo}
                      onChange={handleFormChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="License plate number, car model, color"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Registering..." : "Register Visitor"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor History</CardTitle>
                <CardDescription>
                  View and manage your registered visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="py-6 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : error ? (
                  <div className="py-6 text-center text-red-600">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                          <th className="pb-2">Visitor Name</th>
                          <th className="pb-2">Visit Date</th>
                          <th className="pb-2">Time In</th>
                          <th className="pb-2">Reason</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorHistory.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-8 text-center text-muted-foreground"
                            >
                              No visitor requests found
                            </td>
                          </tr>
                        ) : (
                          visitorHistory.map((visitor) => (
                            <tr key={visitor.id} className="border-b">
                              <td className="py-3">{visitor.visitor_name}</td>
                              <td className="py-3">{visitor.visit_date}</td>
                              <td className="py-3">{visitor.time_in}</td>
                              <td className="py-3 max-w-xs truncate">
                                {visitor.reason}
                              </td>
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
                                        onClick={() =>
                                          setEditingVisitor(visitor)
                                        }
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleCancel(visitor.id)}
                                        disabled={cancelingId === visitor.id}
                                      >
                                        {cancelingId === visitor.id
                                          ? "Cancelling..."
                                          : "Cancel"}
                                      </Button>
                                    </>
                                  )}
                                  {visitor.status === "approved" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCheckIn(visitor.id)}
                                    >
                                      Check In
                                    </Button>
                                  )}
                                  {visitor.status === "checked-in" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCheckOut(visitor.id)}
                                    >
                                      Check Out
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
    </MainLayout>
  );
}
