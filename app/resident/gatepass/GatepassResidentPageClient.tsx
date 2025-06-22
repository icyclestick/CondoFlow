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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createGatepassRequest,
  getMyGatepassRequests,
  cancelGatepassRequest,
} from "@/lib/actions/resident/resident-gatepass";

export default function GatepassPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const [transportDate, setTransportDate] = useState("");
  const [transportTime, setTransportTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { name: "", quantity: 1, description: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [gatepassRequests, setGatepassRequests] = useState<any[]>([]);
  const [viewRequest, setViewRequest] = useState<any | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Fetch gatepass requests on mount
  React.useEffect(() => {
    getMyGatepassRequests().then(setGatepassRequests);
  }, []);

  const handleItemChange = (
    idx: number,
    field: string,
    value: string | number
  ) => {
    setItems((items) =>
      items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    setItems((items) => [...items, { name: "", quantity: 1, description: "" }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((items) =>
      items.length > 1 ? items.filter((_, i) => i !== idx) : items
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (
        !transportDate ||
        !transportTime ||
        !reason ||
        items.some((item) => !item.name || !item.quantity)
      ) {
        setError("Please fill all required fields and at least one item.");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("transportDate", transportDate);
      formData.append("transportTime", transportTime);
      formData.append("reason", reason);
      formData.append("items", JSON.stringify(items));
      formData.append("notes", notes);
      const res = await createGatepassRequest(formData);
      setSuccess("Gatepass request submitted successfully!");
      setTransportDate("");
      setTransportTime("");
      setReason("");
      setNotes("");
      setItems([{ name: "", quantity: 1, description: "" }]);
      setGatepassRequests(await getMyGatepassRequests());
    } catch (err: any) {
      setError(err.message || "Failed to submit gatepass request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    setError("");
    try {
      await cancelGatepassRequest(id);
      setGatepassRequests(await getMyGatepassRequests());
    } catch (err: any) {
      setError(err.message || "Failed to cancel gatepass request.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <MainLayout userName={userName} userRole={userRole as "resident"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gatepass Requests
          </h1>
          <p className="text-muted-foreground">
            Submit and manage your gatepass requests for items
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
                <CardTitle>Submit Gatepass Request</CardTitle>
                <CardDescription>
                  Fill out the form to request a gatepass for items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {success && <div className="text-green-600">{success}</div>}
                  {error && <div className="text-red-600">{error}</div>}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="transport-date">Transport Date</Label>
                      <input
                        id="transport-date"
                        type="date"
                        value={transportDate}
                        onChange={(e) => setTransportDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport-time">Transport Time</Label>
                      <select
                        id="transport-time"
                        value={transportTime}
                        onChange={(e) => setTransportTime(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select a time</option>
                        <option value="morning">
                          Morning (8:00 AM - 12:00 PM)
                        </option>
                        <option value="afternoon">
                          Afternoon (1:00 PM - 5:00 PM)
                        </option>
                        <option value="evening">
                          Evening (6:00 PM - 9:00 PM)
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Gatepass</Label>
                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="delivery">Delivery of new items</option>
                      <option value="removal">Removal of items</option>
                      <option value="repair">Item for repair</option>
                      <option value="other">Other (please specify)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Items to Declare</Label>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                            <th className="p-2">Item Name</th>
                            <th className="p-2">Quantity</th>
                            <th className="p-2">Description</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr className="border-b" key={idx}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Item name"
                                  required
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Qty"
                                  required
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Brief description"
                                />
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  disabled={items.length === 1}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={4} className="p-2">
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={handleAddItem}
                              >
                                Add Another Item
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Any additional information about the items or transport"
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
                <CardTitle>Your Gatepass Request History</CardTitle>
                <CardDescription>
                  View and manage your gatepass requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gatepassRequests.map((request, i) => (
                        <tr key={request.id || i} className="border-b">
                          <td className="py-3">{request.transport_date}</td>
                          <td className="py-3">{request.transport_time}</td>
                          <td className="py-3">{request.reason}</td>
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
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(request.id)}
                                  disabled={cancelingId === request.id}
                                >
                                  {cancelingId === request.id
                                    ? "Canceling..."
                                    : "Cancel"}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Simple Modal for View */}
                {viewRequest && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
                      <h2 className="text-lg font-bold mb-2">
                        Gatepass Request Details
                      </h2>
                      <div className="mb-2">
                        <b>Date:</b> {viewRequest.transport_date}
                      </div>
                      <div className="mb-2">
                        <b>Time:</b> {viewRequest.transport_time}
                      </div>
                      <div className="mb-2">
                        <b>Reason:</b> {viewRequest.reason}
                      </div>
                      <div className="mb-2">
                        <b>Status:</b> {viewRequest.status}
                      </div>
                      <div className="mb-2">
                        <b>Items:</b>{" "}
                        {Array.isArray(viewRequest.items)
                          ? viewRequest.items.join(", ")
                          : JSON.stringify(viewRequest.items)}
                      </div>
                      <div className="mb-2">
                        <b>Notes:</b> {viewRequest.notes || "-"}
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
    </MainLayout>
  );
}
