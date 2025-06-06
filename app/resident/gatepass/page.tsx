import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GatepassPage() {
  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gatepass Requests</h1>
          <p className="text-muted-foreground">Submit and manage your gatepass requests for items</p>
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
                <CardDescription>Fill out the form to request a gatepass for items</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="transport-date">Transport Date</Label>
                      <input
                        id="transport-date"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport-time">Transport Time</Label>
                      <select
                        id="transport-time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a time</option>
                        <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                        <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Gatepass</Label>
                    <select
                      id="reason"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                          <tr className="border-b">
                            <td className="p-2">
                              <input
                                type="text"
                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Item name"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Qty"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Brief description"
                              />
                            </td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm">
                                Remove
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="p-2">
                              <Button variant="outline" size="sm" type="button">
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
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Any additional information about the items or transport"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Gatepass History</CardTitle>
                <CardDescription>View and manage your gatepass requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request ID</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Items</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "GP-2025-001",
                          date: "May 20, 2025",
                          items: "Furniture (3 items)",
                          reason: "Delivery of new items",
                          status: "Pending",
                        },
                        {
                          id: "GP-2025-002",
                          date: "May 25, 2025",
                          items: "Electronics (2 items)",
                          reason: "Item for repair",
                          status: "Approved",
                        },
                        {
                          id: "GP-2025-003",
                          date: "May 10, 2025",
                          items: "Appliances (1 item)",
                          reason: "Removal of items",
                          status: "Completed",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{request.id}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">{request.items}</td>
                          <td className="py-3">{request.reason}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "default"
                                  : request.status === "Completed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && (
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
