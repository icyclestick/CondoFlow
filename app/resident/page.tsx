import Link from "next/link"
import { ArrowRight, Calendar, CreditCard, FileText, MessageSquare, Truck, UserPlus, Wrench } from "lucide-react"

import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResidentDashboard() {
  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, John</h1>
          <p className="text-muted-foreground">Here's what's happening with your unit</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Booking</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Swimming Pool</div>
              <p className="text-xs text-muted-foreground">May 15, 2025 • 2:00 PM - 4:00 PM</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resident/amenities">View All Bookings</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Due</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$350.00</div>
              <p className="text-xs text-muted-foreground">Due on May 30, 2025</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" asChild>
                <Link href="/resident/payments">Pay Now</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resident/requests">View Requests</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto flex-col items-center justify-center gap-2 p-4" asChild>
                  <Link href="/resident/amenities">
                    <Calendar className="h-6 w-6" />
                    <span>Book Amenity</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center gap-2 p-4" asChild>
                  <Link href="/resident/move-requests">
                    <Truck className="h-6 w-6" />
                    <span>Submit Move Request</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center gap-2 p-4" asChild>
                  <Link href="/resident/visitors">
                    <UserPlus className="h-6 w-6" />
                    <span>Add Visitor</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-center justify-center gap-2 p-4" asChild>
                  <Link href="/resident/complaints">
                    <MessageSquare className="h-6 w-6" />
                    <span>File Complaint</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent interactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Amenity Booking Approved",
                    description: "Your booking for the Function Hall has been approved",
                    date: "May 10, 2025",
                    icon: Calendar,
                  },
                  {
                    title: "Payment Received",
                    description: "Your payment of P350 for May dues has been received",
                    date: "May 5, 2025",
                    icon: CreditCard,
                  },
                  {
                    title: "Service Request Completed",
                    description: "Plumbing issue in your bathroom has been fixed",
                    date: "May 3, 2025",
                    icon: Wrench,
                  },
                  {
                    title: "Visitor Approved",
                    description: "Your visitor John Smith has been approved for May 1",
                    date: "April 30, 2025",
                    icon: UserPlus,
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>Status of your recent requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      type: "Amenity Booking",
                      description: "Swimming Pool",
                      date: "May 15, 2025",
                      status: "Approved",
                    },
                    {
                      type: "Service Request",
                      description: "AC Maintenance",
                      date: "May 20, 2025",
                      status: "Pending",
                    },
                    {
                      type: "Visitor Pass",
                      description: "Family Visit (3 people)",
                      date: "May 25, 2025",
                      status: "Pending",
                    },
                    {
                      type: "Complaint",
                      description: "Noise from Unit 302",
                      date: "May 8, 2025",
                      status: "In Progress",
                    },
                  ].map((request, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3">{request.type}</td>
                      <td className="py-3">{request.description}</td>
                      <td className="py-3">{request.date}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            request.status === "Approved"
                              ? "default"
                              : request.status === "In Progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto">
              View All Requests
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}
