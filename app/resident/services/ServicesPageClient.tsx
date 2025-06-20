"use client";

import React, { useState, useEffect } from "react";
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
  createServiceRequest,
  getMyServiceRequests,
  cancelServiceRequest,
} from "@/lib/actions/resident/services";

export default function ServicesPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [description, setDescription] = useState("");
  const [viewRequest, setViewRequest] = useState<any | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    getMyServiceRequests().then(setServiceRequests);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("serviceType", serviceType);
      formData.append("preferredSchedule", preferredSchedule);
      formData.append("urgency", urgency);
      formData.append("description", description);
      await createServiceRequest(formData);
      setSuccess("Service request submitted successfully!");
      setServiceType("");
      setPreferredSchedule("");
      setUrgency("low");
      setDescription("");
      setServiceRequests(await getMyServiceRequests());
    } catch (err: any) {
      setError(err.message || "Failed to submit service request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    setError("");
    try {
      await cancelServiceRequest(id);
      setServiceRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to cancel service request.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <MainLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Requests
          </h1>
          <p className="text-muted-foreground">
            Submit and track maintenance and service requests
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
                <CardTitle>Submit Service Request</CardTitle>
                <CardDescription>
                  Fill out the form to request maintenance or utility services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {success && <div className="text-green-600">{success}</div>}
                  {error && <div className="text-red-600">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="service-type">Service Type</Label>
                    <select
                      id="service-type"
                      name="serviceType"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option value="">Select service type</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC/Air Conditioning</option>
                      <option value="appliance">Appliance Repair</option>
                      <option value="carpentry">Carpentry</option>
                      <option value="painting">Painting</option>
                      <option value="cleaning">Deep Cleaning</option>
                      <option value="pest-control">Pest Control</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-schedule">
                      Preferred Schedule
                    </Label>
                    <select
                      id="preferred-schedule"
                      name="preferredSchedule"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={preferredSchedule}
                      onChange={(e) => setPreferredSchedule(e.target.value)}
                    >
                      <option value="">Select preferred time</option>
                      <option value="morning">
                        Morning (8:00 AM - 12:00 PM)
                      </option>
                      <option value="afternoon">
                        Afternoon (1:00 PM - 5:00 PM)
                      </option>
                      <option value="evening">
                        Evening (6:00 PM - 8:00 PM)
                      </option>
                      <option value="weekend">Weekend</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <select
                      id="urgency"
                      name="urgency"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="low">Low - Can wait up to a week</option>
                      <option value="medium">Medium - Within 2-3 days</option>
                      <option value="high">High - Within 24 hours</option>
                      <option value="emergency">
                        Emergency - Immediate attention required
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please provide a detailed description of the issue or service needed"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Service Request History</CardTitle>
                <CardDescription>
                  View and track your service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request ID</th>
                        <th className="pb-2">Service Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Urgency</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRequests.map((request, i) => (
                        <tr key={request.id || i} className="border-b">
                          <td className="py-3">{request.id}</td>
                          <td className="py-3">{request.service_type}</td>
                          <td className="py-3">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.urgency === "emergency" ||
                                request.urgency === "high"
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
                                  : request.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setViewRequest(request)}
                              >
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCancel(request.id)}
                              >
                                <span className="sr-only">Cancel</span>
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
