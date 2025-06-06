import Link from "next/link"
import { ArrowRight, Calendar, DollarSign, MessageSquare, Users } from "lucide-react"

import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your condo management system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+6 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,563</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Requires your attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">-2 from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="amenities">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="amenities">Amenity Bookings</TabsTrigger>
            <TabsTrigger value="move">Move Requests</TabsTrigger>
            <TabsTrigger value="gatepass">Gatepass</TabsTrigger>
          </TabsList>
          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest Amenity Bookings</CardTitle>
                <CardDescription>You have 6 pending amenity booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Amenity</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          resident: "John Doe",
                          amenity: "Swimming Pool",
                          date: "May 15, 2025",
                          status: "Pending",
                        },
                        {
                          resident: "Jane Smith",
                          amenity: "Gym",
                          date: "May 16, 2025",
                          status: "Approved",
                        },
                        {
                          resident: "Robert Johnson",
                          amenity: "Function Hall",
                          date: "May 20, 2025",
                          status: "Pending",
                        },
                        {
                          resident: "Emily Davis",
                          amenity: "Tennis Court",
                          date: "May 18, 2025",
                          status: "Pending",
                        },
                      ].map((booking, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{booking.resident}</td>
                          <td className="py-3">{booking.amenity}</td>
                          <td className="py-3">{booking.date}</td>
                          <td className="py-3">
                            <Badge variant={booking.status === "Pending" ? "outline" : "default"}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {booking.status === "Pending" && <Button size="sm">Approve</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/amenities">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="move" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Move Requests</CardTitle>
                <CardDescription>You have 3 pending move requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Unit</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          resident: "Michael Brown",
                          type: "Move-in",
                          unit: "Block A, #203",
                          date: "May 25, 2025",
                          status: "Pending",
                        },
                        {
                          resident: "Sarah Wilson",
                          type: "Move-out",
                          unit: "Block B, #512",
                          date: "May 30, 2025",
                          status: "Approved",
                        },
                        {
                          resident: "David Lee",
                          type: "Move-in",
                          unit: "Block C, #108",
                          date: "June 2, 2025",
                          status: "Pending",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.type}</td>
                          <td className="py-3">{request.unit}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">
                            <Badge variant={request.status === "Pending" ? "outline" : "default"}>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && <Button size="sm">Approve</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/move-requests">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="gatepass" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gatepass Requests</CardTitle>
                <CardDescription>You have 4 pending gatepass requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Items</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          resident: "Thomas Anderson",
                          items: "Furniture (3 items)",
                          date: "May 14, 2025",
                          status: "Pending",
                        },
                        {
                          resident: "Lisa Chen",
                          items: "Electronics (2 items)",
                          date: "May 15, 2025",
                          status: "Approved",
                        },
                        {
                          resident: "James Wilson",
                          items: "Appliances (1 item)",
                          date: "May 16, 2025",
                          status: "Pending",
                        },
                        {
                          resident: "Maria Garcia",
                          items: "Furniture (5 items)",
                          date: "May 17, 2025",
                          status: "Pending",
                        },
                      ].map((request, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{request.resident}</td>
                          <td className="py-3">{request.items}</td>
                          <td className="py-3">{request.date}</td>
                          <td className="py-3">
                            <Badge variant={request.status === "Pending" ? "outline" : "default"}>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {request.status === "Pending" && <Button size="sm">Approve</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <Link href="/admin/gatepass">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Units Overview</CardTitle>
              <CardDescription>Current occupancy and unit status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Units</p>
                    <p className="text-2xl font-bold">200</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Occupied</p>
                    <p className="text-2xl font-bold">178</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Vacant</p>
                    <p className="text-2xl font-bold">22</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Block A</p>
                    <p>48/50 units occupied</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "96%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Block B</p>
                    <p>45/50 units occupied</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Block C</p>
                    <p>42/50 units occupied</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "84%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Block D</p>
                    <p>43/50 units occupied</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "86%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href="/admin/units">
                  View All Units
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
              <CardDescription>Monthly dues and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Due</p>
                    <p className="text-2xl font-bold">$35,200</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Collected</p>
                    <p className="text-2xl font-bold">$28,450</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Outstanding</p>
                    <p className="text-2xl font-bold">$6,750</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Association Dues</p>
                    <p>$18,200 / $20,000</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "91%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Utility Fees</p>
                    <p>$6,250 / $8,200</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "76%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Parking Fees</p>
                    <p>$4,000 / $7,000</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "57%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href="/admin/payments">
                  View All Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
