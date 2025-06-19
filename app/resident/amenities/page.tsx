"use client";

import React, { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createAmenityBooking,
  getAvailableAmenities,
  getMyAmenityBookings,
} from "@/lib/actions/resident/resident-amenities";

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    amenity: "",
    date: "",
    time: "",
    guests: 1,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const amenitiesData = await getAvailableAmenities();
        setAmenities(amenitiesData);
        const bookingsData = await getMyAmenityBookings();
        setBookings(bookingsData);
      } catch (err) {
        setError("Failed to load amenities or bookings.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [success]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("amenity", form.amenity);
      formData.append("date", form.date);
      formData.append("time", form.time);
      formData.append("guests", String(form.guests));
      formData.append("notes", form.notes);
      await createAmenityBooking(formData);
      setSuccess("Booking submitted!");
      setForm({ amenity: "", date: "", time: "", guests: 1, notes: "" });
    } catch (err) {
      setError(err?.message || "Failed to submit booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout userRole="resident">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amenity Booking</h1>
          <p className="text-muted-foreground">
            Book and manage your amenity reservations
          </p>
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
                <CardDescription>
                  Fill out the form to book an amenity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      htmlFor="amenity"
                      className="text-sm font-medium leading-none"
                    >
                      Select Amenity
                    </label>
                    <select
                      id="amenity"
                      value={form.amenity}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select an amenity</option>
                      {amenities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="date"
                        className="text-sm font-medium leading-none"
                      >
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="time"
                        className="text-sm font-medium leading-none"
                      >
                        Time Slot
                      </label>
                      <select
                        id="time"
                        value={form.time}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
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
                      className="text-sm font-medium leading-none"
                    >
                      Number of Guests
                    </label>
                    <input
                      id="guests"
                      type="number"
                      min="1"
                      max="20"
                      value={form.guests}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          guests: Number(e.target.value),
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Enter number of guests"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium leading-none"
                    >
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Any special requests or information"
                    ></textarea>
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  {success && (
                    <div className="text-green-600 text-sm">{success}</div>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Booking"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Booking History</CardTitle>
                <CardDescription>
                  View and manage your amenity bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                          <th className="pb-2">Amenity</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Time</th>
                          <th className="pb-2">Guests</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-3 text-center text-muted-foreground"
                            >
                              No bookings found.
                            </td>
                          </tr>
                        ) : (
                          bookings.map((booking, i) => (
                            <tr key={booking.id || i} className="border-b">
                              <td className="py-3">
                                {booking.amenities?.name || "-"}
                              </td>
                              <td className="py-3">{booking.booking_date}</td>
                              <td className="py-3">{booking.time_slot}</td>
                              <td className="py-3">{booking.guests}</td>
                              <td className="py-3">
                                <Badge
                                  variant={
                                    booking.status === "approved"
                                      ? "default"
                                      : booking.status === "completed"
                                      ? "secondary"
                                      : booking.status === "cancelled"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
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
