import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MoveRequestsPage() {
  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Move Requests</h1>
          <p className="text-muted-foreground">Submit and manage your move-in/move-out requests</p>
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
                <CardDescription>Fill out the form to submit a move-in or move-out request</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label>Move Type</Label>
                    <RadioGroup defaultValue="move-in">
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
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="move-date">Move Date</Label>
                      <input
                        id="move-date"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="move-time">Preferred Time</Label>
                      <select
                        id="move-time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a time slot</option>
                        <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="movers">Moving Company (Optional)</Label>
                    <input
                      id="movers"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter moving company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Move</Label>
                    <textarea
                      id="reason"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please provide a brief reason for your move"
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items">Large Items to Move</Label>
                    <textarea
                      id="items"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="List any large items that will require special handling (e.g., sofa, refrigerator)"
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
                <CardTitle>Your Move Request History</CardTitle>
                <CardDescription>View and manage your move requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Request Type</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          type: "Move-in",
                          date: "June 15, 2024",
                          time: "Morning",
                          status: "Completed",
                        },
                        {
                          type: "Move-out",
                          date: "May 30, 2025",
                          time: "Afternoon",
                          status: "Pending",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{request.type}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">{request.time}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                request.status === "Completed"
                                  ? "secondary"
                                  : request.status === "Approved"
                                    ? "default"
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
