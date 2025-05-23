import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AmenitiesPage() {
  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amenity Booking</h1>
          <p className="text-muted-foreground">Book and manage your amenity reservations</p>
        </div>

        <Tabs defaultValue="book">
          <TabsList>
            <TabsTrigger value="book">Book Amenity</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>
          <TabsContent value="book" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Amenity Booking</CardTitle>
                <CardDescription>Fill out the form to book an amenity</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="amenity"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select Amenity
                    </label>
                    <select
                      id="amenity"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select an amenity</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="gym">Gym</option>
                      <option value="function-hall">Function Hall</option>
                      <option value="tennis">Tennis Court</option>
                      <option value="bbq">BBQ Area</option>
                    </select>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="date"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="time"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Time Slot
                      </label>
                      <select
                        id="time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a time slot</option>
                        <option value="8-10">8:00 AM - 10:00 AM</option>
                        <option value="10-12">10:00 AM - 12:00 PM</option>
                        <option value="12-2">12:00 PM - 2:00 PM</option>
                        <option value="2-4">2:00 PM - 4:00 PM</option>
                        <option value="4-6">4:00 PM - 6:00 PM</option>
                        <option value="6-8">6:00 PM - 8:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="guests"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Number of Guests
                    </label>
                    <input
                      id="guests"
                      type="number"
                      min="1"
                      max="20"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter number of guests"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Any special requests or information"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Submit Booking</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Booking History</CardTitle>
                <CardDescription>View and manage your amenity bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
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
                          amenity: "Swimming Pool",
                          date: "May 15, 2025",
                          time: "2:00 PM - 4:00 PM",
                          guests: 2,
                          status: "Approved",
                        },
                        {
                          amenity: "Function Hall",
                          date: "May 20, 2025",
                          time: "6:00 PM - 8:00 PM",
                          guests: 15,
                          status: "Pending",
                        },
                        {
                          amenity: "Tennis Court",
                          date: "May 22, 2025",
                          time: "10:00 AM - 12:00 PM",
                          guests: 4,
                          status: "Approved",
                        },
                        {
                          amenity: "BBQ Area",
                          date: "May 25, 2025",
                          time: "4:00 PM - 6:00 PM",
                          guests: 8,
                          status: "Pending",
                        },
                        {
                          amenity: "Gym",
                          date: "May 10, 2025",
                          time: "8:00 AM - 10:00 AM",
                          guests: 1,
                          status: "Completed",
                        },
                      ].map((booking, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3">{booking.amenity}</td>
                          <td className="py-3">{booking.date}</td>
                          <td className="py-3">{booking.time}</td>
                          <td className="py-3">{booking.guests}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                booking.status === "Approved"
                                  ? "default"
                                  : booking.status === "Completed"
                                    ? "secondary"
                                    : "outline"
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
                              {booking.status !== "Completed" && (
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
