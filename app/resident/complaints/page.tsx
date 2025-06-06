import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ComplaintsPage() {
  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">Submit and track complaints or issues</p>
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
                <CardDescription>Fill out the form to submit a complaint or report an issue</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="complaint-type">Complaint Type</Label>
                    <select
                      id="complaint-type"
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
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Where is the issue occurring?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please provide a detailed description of the issue"
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Image (Optional)</Label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">Low - Can be addressed within a week</option>
                      <option value="medium">Medium - Should be addressed within 2-3 days</option>
                      <option value="high">High - Requires attention within 24 hours</option>
                      <option value="emergency">Emergency - Requires immediate attention</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Submit Complaint</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Complaint History</CardTitle>
                <CardDescription>View and track the status of your complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Last Update</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "C-2025-001",
                          type: "Noise Complaint",
                          date: "May 8, 2025",
                          status: "In Progress",
                          lastUpdate: "May 10, 2025",
                        },
                        {
                          id: "C-2025-002",
                          type: "Maintenance Issue",
                          date: "May 5, 2025",
                          status: "Resolved",
                          lastUpdate: "May 7, 2025",
                        },
                        {
                          id: "C-2025-003",
                          type: "Common Area Issue",
                          date: "May 1, 2025",
                          status: "Pending",
                          lastUpdate: "May 1, 2025",
                        },
                        {
                          id: "C-2025-004",
                          type: "Security Concern",
                          date: "April 28, 2025",
                          status: "Resolved",
                          lastUpdate: "May 2, 2025",
                        },
                      ].map((complaint, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{complaint.id}</td>
                          <td className="py-3">{complaint.type}</td>
                          <td className="py-3">{complaint.date}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                complaint.status === "Resolved"
                                  ? "default"
                                  : complaint.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {complaint.status}
                            </Badge>
                          </td>
                          <td className="py-3">{complaint.lastUpdate}</td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {complaint.status === "Pending" && (
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
