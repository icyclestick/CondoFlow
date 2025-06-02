"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function VisitorsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Here you would call your server action
      // await createVisitorRequest(formData)

      toast({
        title: "Visitor Registered",
        description: "Your visitor has been registered successfully.",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register visitor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Registration</h1>
          <p className="text-muted-foreground">Register and manage your visitors</p>
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
                <CardDescription>Fill out the form to register a visitor</CardDescription>
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time-out">Expected Time Out</Label>
                      <input
                        id="time-out"
                        name="timeOut"
                        type="time"
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
                    <Label htmlFor="vehicle-info">Vehicle Information (Optional)</Label>
                    <input
                      id="vehicle-info"
                      name="vehicleInfo"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="License plate number, car model, color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
                    <textarea
                      id="additional-notes"
                      name="additionalNotes"
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
                <CardDescription>View and manage your registered visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Visitor Name</th>
                        <th className="pb-2">Visit Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "John Smith",
                          date: "May 15, 2025",
                          time: "2:00 PM - 4:00 PM",
                          reason: "Personal Visit",
                          status: "Approved",
                        },
                        {
                          name: "Sarah Johnson",
                          date: "May 20, 2025",
                          time: "10:00 AM - 12:00 PM",
                          reason: "Business Meeting",
                          status: "Pending",
                        },
                        {
                          name: "Mike Wilson",
                          date: "May 12, 2025",
                          time: "6:00 PM - 8:00 PM",
                          reason: "Family Visit",
                          status: "Checked Out",
                        },
                        {
                          name: "Lisa Brown",
                          date: "May 25, 2025",
                          time: "1:00 PM - 3:00 PM",
                          reason: "Delivery",
                          status: "Pending",
                        },
                      ].map((visitor, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{visitor.name}</td>
                          <td className="py-3">{visitor.date}</td>
                          <td className="py-3">{visitor.time}</td>
                          <td className="py-3">{visitor.reason}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                visitor.status === "Approved"
                                  ? "default"
                                  : visitor.status === "Checked Out"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {visitor.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {visitor.status === "Pending" && (
                                <Button size="sm" variant="destructive">
                                  Cancel
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
  )
}
