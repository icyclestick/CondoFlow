"use client";

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
import { useEffect, useState } from "react";
import {
  getMyComplaints,
  createComplaint,
  cancelComplaint,
  updateMyComplaint,
} from "@/lib/actions/resident/resident-complaints";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Complaint {
  id: string;
  complaint_type: string;
  description?: string;
  location?: string;
  urgency?: string;
  image_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  admin_response?: string | null;
}

export default function ComplaintsPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [form, setForm] = useState({
    complaintType: "",
    location: "",
    description: "",
    urgency: "low",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    null
  );
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyComplaints()
      .then((data) => setComplaints(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.message || "Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setForm((prev) => ({ ...prev, imageUrl: files[0].name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("complaintType", form.complaintType);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("urgency", form.urgency);
      formData.append("imageUrl", form.imageUrl);
      await createComplaint(formData);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted.",
      });
      setForm({
        complaintType: "",
        location: "",
        description: "",
        urgency: "low",
        imageUrl: "",
      });
      // Refresh complaints list
      getMyComplaints().then(setComplaints);
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
      toast({
        title: "Error",
        description: err.message || "Failed to submit complaint",
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
      await cancelComplaint(id);
      setComplaints(await getMyComplaints());
      toast({
        title: "Complaint Cancelled",
        description: "Your complaint has been cancelled successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to cancel complaint.");
      toast({
        title: "Error",
        description: err.message || "Failed to cancel complaint",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsEditing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("complaintType", editingComplaint.complaint_type || "");
      formData.append("location", editingComplaint.location || "");
      formData.append("description", editingComplaint.description || "");
      formData.append("urgency", editingComplaint.urgency || "medium");
      formData.append("imageUrl", editingComplaint.image_url || "");

      await updateMyComplaint(editingComplaint.id, formData);

      setComplaints(await getMyComplaints());
      setEditingComplaint(null);
      toast({
        title: "Complaint Updated",
        description: "Your complaint has been updated successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update complaint.");
      toast({
        title: "Error",
        description: err.message || "Failed to update complaint",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">
            Submit and track complaints or issues
          </p>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New Complaint</TabsTrigger>
            <TabsTrigger value="history">Complaint History</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Complaint</CardTitle>
                <CardDescription>
                  Fill out the form to submit a complaint or report an issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-type">Complaint Type</Label>
                    <select
                      id="complaint-type"
                      name="complaintType"
                      value={form.complaintType}
                      onChange={handleFormChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select complaint type</option>
                      <option value="noise">Noise Complaint</option>
                      <option value="maintenance">Maintenance Issue</option>
                      <option value="security">Security Concern</option>
                      <option value="neighbor">Neighbor Dispute</option>
                      <option value="common-area">Common Area Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={form.location}
                      onChange={handleFormChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Where is the issue occurring?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please provide a detailed description of the issue"
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Image (Optional)</Label>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an image to help illustrate the issue (max 5MB)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={form.urgency}
                      onChange={handleFormChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">
                        Low - Can be addressed within a week
                      </option>
                      <option value="medium">
                        Medium - Should be addressed within 2-3 days
                      </option>
                      <option value="high">
                        High - Requires attention within 24 hours
                      </option>
                      <option value="emergency">
                        Emergency - Requires immediate attention
                      </option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Complaint"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Complaint History</CardTitle>
                <CardDescription>
                  View and track the status of your complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
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
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Urgency</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-3 text-center text-muted-foreground"
                            >
                              No complaints found.
                            </td>
                          </tr>
                        ) : (
                          complaints.map((complaint) => (
                            <tr key={complaint.id} className="border-b">
                              <td className="py-2">
                                {complaint.id.slice(0, 8)}
                              </td>
                              <td className="py-2">
                                {complaint.complaint_type}
                              </td>
                              <td className="py-2">
                                {complaint.created_at
                                  ? new Date(
                                      complaint.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="py-2">
                                <Badge
                                  variant={
                                    complaint.status === "resolved"
                                      ? "default"
                                      : complaint.status === "in-progress"
                                      ? "secondary"
                                      : complaint.status === "cancelled"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {complaint.status}
                                </Badge>
                              </td>
                              <td className="py-2">
                                <Badge
                                  variant={
                                    complaint.urgency === "emergency" ||
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
                              <td className="py-2">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setViewComplaint(complaint)}
                                  >
                                    View
                                  </Button>
                                  {complaint.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setEditingComplaint(complaint)
                                        }
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleCancel(complaint.id)
                                        }
                                        disabled={cancelingId === complaint.id}
                                      >
                                        {cancelingId === complaint.id
                                          ? "Cancelling..."
                                          : "Cancel"}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Complaint Modal */}
      <Dialog
        open={!!viewComplaint}
        onOpenChange={() => setViewComplaint(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {viewComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Complaint ID</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewComplaint.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewComplaint.complaint_type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewComplaint.location}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        viewComplaint.status === "resolved"
                          ? "default"
                          : viewComplaint.status === "in-progress"
                          ? "secondary"
                          : viewComplaint.status === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {viewComplaint.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgency</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        viewComplaint.urgency === "emergency" ||
                        viewComplaint.urgency === "high"
                          ? "destructive"
                          : viewComplaint.urgency === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {viewComplaint.urgency}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewComplaint.created_at
                      ? new Date(viewComplaint.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {viewComplaint.description}
                </p>
              </div>
              {viewComplaint.admin_response && (
                <div>
                  <Label className="text-sm font-medium">Admin Response</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewComplaint.admin_response}
                  </p>
                </div>
              )}
              {viewComplaint.image_url && (
                <div>
                  <Label className="text-sm font-medium">Attached Image</Label>
                  <div className="mt-2">
                    <img
                      src={viewComplaint.image_url}
                      alt="Complaint evidence"
                      className="max-w-xs rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewComplaint(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Complaint Modal */}
      <Dialog
        open={!!editingComplaint}
        onOpenChange={() => setEditingComplaint(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
          </DialogHeader>
          {editingComplaint && (
            <form onSubmit={handleEdit} className="space-y-6">
              {error && <div className="text-red-600">{error}</div>}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-complaint-type">Complaint Type</Label>
                  <select
                    id="edit-complaint-type"
                    name="complaintType"
                    required
                    value={editingComplaint.complaint_type || ""}
                    onChange={(e) =>
                      setEditingComplaint({
                        ...editingComplaint,
                        complaint_type: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="noise">Noise Complaint</option>
                    <option value="maintenance">Maintenance Issue</option>
                    <option value="security">Security Concern</option>
                    <option value="neighbor">Neighbor Dispute</option>
                    <option value="common-area">Common Area Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    required
                    value={editingComplaint.location || ""}
                    onChange={(e) =>
                      setEditingComplaint({
                        ...editingComplaint,
                        location: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Where is the issue occurring?"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  required
                  value={editingComplaint.description || ""}
                  onChange={(e) =>
                    setEditingComplaint({
                      ...editingComplaint,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[120px]"
                  placeholder="Please provide a detailed description of the issue"
                />
              </div>

              <div>
                <Label htmlFor="edit-urgency">Urgency Level</Label>
                <select
                  id="edit-urgency"
                  name="urgency"
                  required
                  value={editingComplaint.urgency || "medium"}
                  onChange={(e) =>
                    setEditingComplaint({
                      ...editingComplaint,
                      urgency: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">
                    Low - Can be addressed within a week
                  </option>
                  <option value="medium">
                    Medium - Should be addressed within 2-3 days
                  </option>
                  <option value="high">
                    High - Requires attention within 24 hours
                  </option>
                  <option value="emergency">
                    Emergency - Requires immediate attention
                  </option>
                </select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingComplaint(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? "Updating..." : "Update Complaint"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
