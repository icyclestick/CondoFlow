"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Calendar, Users, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminAmenitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const { toast } = useToast()

  const handleApprove = async (bookingId: string) => {
    try {
      // await approveAmenityBooking(bookingId)
      toast({
        title: "Booking Approved",
        description: "The amenity booking has been approved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve booking.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      // await rejectAmenityBooking(bookingId)
      toast({
        title: "Booking Rejected",
        description: "The amenity booking has been rejected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject booking.",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Amenity Management</h1>
            <p className="text-muted-foreground">Manage amenity bookings and availability</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Amenity
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Pool</div>
              <p className="text-xs text-muted-foreground">45 bookings this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,340</div>
              <p className="text-xs text-muted-foreground">From bookings</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Bookings</CardTitle>
                <CardDescription>Manage and approve amenity booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-2">Resident</th>
                        <th className="pb-2">Amenity</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Guests</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "1",
                          resident: "John Doe",
                          amenity: "Swimming Pool",
                          date: "May 15, 2025",
                          time: "2:00 PM - 4:00 PM",
                          guests: 2,
                          status: "Pending",
                        },
                        {
                          id: "2",
                          resident: "Jane Smith",
                          amenity: "Function Hall",
                          date: "May 20, 2025",
                          time: "6:00 PM - 10:00 PM",
                          guests: 25,
                          status: "Pending",
                        },
                        {
                          id: "3",
                          resident: "Robert Johnson",
                          amenity: "Tennis Court",
                          date: "May 18, 2025",
                          time: "10:00 AM - 12:00 PM",
                          guests: 4,
                          status: "Approved",
                        },
                        {
                          id: "4",
                          resident: "Emily Davis",
                          amenity: "BBQ Area",
                          date: "May 22, 2025",
                          time: "4:00 PM - 8:00 PM",
                          guests: 8,
                          status: "Pending",
                        },
                      ].map((booking, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{booking.resident}</td>
                          <td className="py-3">{booking.amenity}</td>
                          <td className="py-3">{booking.date}</td>
                          <td className="py-3">{booking.time}</td>
                          <td className="py-3">{booking.guests}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                booking.status === "Approved"
                                  ? "default"
                                  : booking.status === "Pending"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {booking.status === "Pending" && (
                                <>
                                  <Button size="sm" onClick={() => handleApprove(booking.id)}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleReject(booking.id)}>
                                    Reject
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
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Amenities</CardTitle>
                <CardDescription>Manage amenity details and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: "Swimming Pool", capacity: 20, rate: "$15/hour", status: "Available" },
                    { name: "Function Hall", capacity: 50, rate: "$50/hour", status: "Available" },
                    { name: "Tennis Court", capacity: 4, rate: "$20/hour", status: "Maintenance" },
                    { name: "Gym", capacity: 15, rate: "$10/hour", status: "Available" },
                    { name: "BBQ Area", capacity: 12, rate: "$25/hour", status: "Available" },
                    { name: "Kids Playground", capacity: 20, rate: "Free", status: "Available" },
                  ].map((amenity, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg">{amenity.name}</CardTitle>
                        <Badge variant={amenity.status === "Available" ? "default" : "secondary"}>
                          {amenity.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Capacity:</strong> {amenity.capacity} people
                          </p>
                          <p className="text-sm">
                            <strong>Rate:</strong> {amenity.rate}
                          </p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Schedule</CardTitle>
                <CardDescription>View amenity booking schedule and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Calendar view would be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This would show a calendar with all bookings and available time slots
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
