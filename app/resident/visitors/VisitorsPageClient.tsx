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
} from "@/lib/actions/resident/resident-visitors";

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
    timeOut: "",
    reason: "",
    vehicleInfo: "",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      formData.append("timeOut", form.timeOut);
      formData.append("reason", form.reason);
      formData.append("vehicleInfo", form.vehicleInfo);
      formData.append("additionalNotes", form.additionalNotes);
      await createVisitorRequest(formData);
      toast({
        title: "Visitor Registered",
        description: "Your visitor has been registered successfully.",
      });
      setForm({
        visitorName: "",
        visitDate: "",
        timeIn: "",
        timeOut: "",
        reason: "",
        vehicleInfo: "",
        additionalNotes: "",
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
                    <div className="space-y-2">
                      <Label htmlFor="time-out">Expected Time Out</Label>
                      <input
                        id="time-out"
                        name="timeOut"
                        type="time"
                        value={form.timeOut}
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
                  <div className="space-y-2">
                    <Label htmlFor="additional-notes">
                      Additional Notes (Optional)
                    </Label>
                    <textarea
                      id="additional-notes"
                      name="additionalNotes"
                      value={form.additionalNotes}
                      onChange={handleFormChange}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Any additional information about the visitor"
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
                        <tr>
                          <th>Visitor Name</th>
                          <th>Visit Date</th>
                          <th>Time In</th>
                          <th>Time Out</th>
                          <th>Reason</th>
                          <th>Vehicle Info</th>
                          <th>Additional Notes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorHistory.map((visitor) => (
                          <tr key={visitor.id}>
                            <td>{visitor.visitorName}</td>
                            <td>{visitor.visitDate}</td>
                            <td>{visitor.timeIn}</td>
                            <td>{visitor.timeOut}</td>
                            <td>{visitor.reason}</td>
                            <td>{visitor.vehicleInfo}</td>
                            <td>{visitor.additionalNotes}</td>
                            <td>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Delete</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
