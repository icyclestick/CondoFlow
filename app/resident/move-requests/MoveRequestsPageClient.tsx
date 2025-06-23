"use client";

import React, { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createMoveRequest,
  getMyMoveRequests,
  cancelMoveRequest,
  updateMyMoveRequest,
  getMyAvailableUnits,
} from "@/lib/actions/resident/resident-move-requests";

export default function MoveRequestsPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [type, setType] = useState("move-in");
  const [moveDate, setMoveDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [movingCompany, setMovingCompany] = useState("");
  const [reason, setReason] = useState("");
  const [largeItems, setLargeItems] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [moveRequests, setMoveRequests] = useState<any[]>([]);
  const [viewRequest, setViewRequest] = useState<any | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Generate hourly time slots from 8:00 AM to 6:00 PM
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i;
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
    return `${start} - ${end}`;
  });

  // Fetch move requests and available units on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsData, unitsData] = await Promise.all([
          getMyMoveRequests(),
          getMyAvailableUnits(),
        ]);
        setMoveRequests(requestsData);
        setAvailableUnits(unitsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("moveDate", moveDate);
      formData.append("timeSlot", timeSlot);
      formData.append("movingCompany", movingCompany);
      formData.append("reason", reason);
      formData.append("largeItems", largeItems);
      formData.append("unitId", selectedUnitId);
      const res = await createMoveRequest(formData);
      setSuccess("Move request submitted successfully!");
      setType("move-in");
      setMoveDate("");
      setTimeSlot("");
      setMovingCompany("");
      setReason("");
      setLargeItems("");
      setSelectedUnitId("");
      // Refresh move requests
      setMoveRequests(await getMyMoveRequests());
    } catch (err: any) {
      setError(err.message || "Failed to submit move request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    setError("");
    try {
      await cancelMoveRequest(id);
      // Refresh move requests instead of filtering
      setMoveRequests(await getMyMoveRequests());
    } catch (err: any) {
      setError(err.message || "Failed to cancel move request.");
    } finally {
      setCancelingId(null);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    setIsEditing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("moveDate", editingRequest.move_date);
      formData.append("timeSlot", editingRequest.time_slot);
      formData.append("movingCompany", editingRequest.moving_company || "");
      formData.append("reason", editingRequest.reason);
      formData.append("largeItems", editingRequest.large_items || "");
      formData.append("unitId", editingRequest.unit_id || "");

      await updateMyMoveRequest(editingRequest.id, formData);

      setMoveRequests(await getMyMoveRequests());
      setEditingRequest(null);
      setSuccess("Move request updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update move request.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Move Requests</h1>
          <p className="text-muted-foreground">
            Submit and manage your move-in/move-out requests
          </p>
        </div>

        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Move Request</CardTitle>
                <CardDescription>
                  Fill out the form to submit a move-in or move-out request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {success && <div className="text-green-600">{success}</div>}
                  {error && <div className="text-red-600">{error}</div>}
                  <div className="space-y-2">
                    <Label>Move Type</Label>
                    <RadioGroup
                      value={type}
                      onValueChange={setType}
                      defaultValue="move-in"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="move-in" id="move-in" />
                        <Label htmlFor="move-in">Move-in</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="move-out" id="move-out" />
                        <Label htmlFor="move-out">Move-out</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select a unit</option>
                      {availableUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Block {unit.block}, Unit {unit.unit_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="move-date">Move Date</Label>
                      <input
                        id="move-date"
                        type="date"
                        value={moveDate}
                        onChange={(e) => setMoveDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="move-time">Time Slot</Label>
                      <select
                        id="move-time"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select a time slot</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="movers">Moving Company (Optional)</Label>
                    <input
                      id="movers"
                      type="text"
                      value={movingCompany}
                      onChange={(e) => setMovingCompany(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter moving company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Move</Label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please provide a brief reason for your move"
                      required
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items">Large Items to Move</Label>
                    <textarea
                      id="items"
                      value={largeItems}
                      onChange={(e) => setLargeItems(e.target.value)}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="List any large items that will require special handling (e.g., sofa, refrigerator)"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Move Request History</CardTitle>
                <CardDescription>
                  View and manage your move requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request Type</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moveRequests.map((request, i) => (
                        <tr key={request.id || i} className="border-b">
                          <td className="py-3">{request.type}</td>
                          <td className="py-3">
                            {request.unit_id
                              ? availableUnits.find(
                                  (u) => u.id === request.unit_id
                                )
                                ? `Block ${
                                    availableUnits.find(
                                      (u) => u.id === request.unit_id
                                    ).block
                                  }, Unit ${
                                    availableUnits.find(
                                      (u) => u.id === request.unit_id
                                    ).unit_number
                                  }`
                                : "Unit not found"
                              : "No unit specified"}
                          </td>
                          <td className="py-3">{request.move_date}</td>
                          <td className="py-3">{request.time_slot}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "completed"
                                  ? "secondary"
                                  : request.status === "approved"
                                  ? "default"
                                  : request.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
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
                                onClick={() => setViewRequest(request)}
                              >
                                View
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingRequest(request)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancel(request.id)}
                                    disabled={cancelingId === request.id}
                                  >
                                    {cancelingId === request.id
                                      ? "Cancelling..."
                                      : "Cancel"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* View Request Modal */}
                {viewRequest && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
                      <h2 className="text-lg font-bold mb-2">
                        Move Request Details
                      </h2>
                      <div className="mb-2">
                        <b>Type:</b> {viewRequest.type}
                      </div>
                      <div className="mb-2">
                        <b>Unit:</b>{" "}
                        {viewRequest.unit_id
                          ? availableUnits.find(
                              (u) => u.id === viewRequest.unit_id
                            )
                            ? `Block ${
                                availableUnits.find(
                                  (u) => u.id === viewRequest.unit_id
                                ).block
                              }, Unit ${
                                availableUnits.find(
                                  (u) => u.id === viewRequest.unit_id
                                ).unit_number
                              }`
                            : "Unit not found"
                          : "No unit specified"}
                      </div>
                      <div className="mb-2">
                        <b>Date:</b> {viewRequest.move_date}
                      </div>
                      <div className="mb-2">
                        <b>Time Slot:</b> {viewRequest.time_slot}
                      </div>
                      <div className="mb-2">
                        <b>Moving Company:</b>{" "}
                        {viewRequest.moving_company || "-"}
                      </div>
                      <div className="mb-2">
                        <b>Reason:</b> {viewRequest.reason}
                      </div>
                      <div className="mb-2">
                        <b>Large Items:</b> {viewRequest.large_items || "-"}
                      </div>
                      <div className="mb-2">
                        <b>Status:</b> {viewRequest.status}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewRequest(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Request Modal */}
      <Dialog
        open={!!editingRequest}
        onOpenChange={() => setEditingRequest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Move Request</DialogTitle>
          </DialogHeader>
          {editingRequest && (
            <form onSubmit={handleEdit} className="space-y-6">
              {error && <div className="text-red-600">{error}</div>}
              {success && <div className="text-green-600">{success}</div>}

              <div className="space-y-2">
                <Label>Move Type</Label>
                <div className="text-sm text-muted-foreground">
                  {editingRequest.type === "move-in" ? "Move-in" : "Move-out"}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <select
                  id="edit-unit"
                  value={editingRequest.unit_id || ""}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      unit_id: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a unit</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Block {unit.block}, Unit {unit.unit_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-move-date">Move Date</Label>
                  <input
                    id="edit-move-date"
                    type="date"
                    value={editingRequest.move_date}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        move_date: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-move-time">Time Slot</Label>
                  <select
                    id="edit-move-time"
                    value={editingRequest.time_slot}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        time_slot: e.target.value,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-movers">Moving Company (Optional)</Label>
                <input
                  id="edit-movers"
                  type="text"
                  value={editingRequest.moving_company || ""}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      moving_company: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter moving company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reason">Reason for Move</Label>
                <textarea
                  id="edit-reason"
                  value={editingRequest.reason}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      reason: e.target.value,
                    })
                  }
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Please provide a brief reason for your move"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-items">Large Items to Move</Label>
                <textarea
                  id="edit-items"
                  value={editingRequest.large_items || ""}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      large_items: e.target.value,
                    })
                  }
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="List any large items that will require special handling (e.g., sofa, refrigerator)"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRequest(null)}
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
