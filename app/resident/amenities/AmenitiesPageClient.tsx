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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAmenityBooking,
  getAvailableAmenities,
  getMyAmenityBookings,
  cancelAmenityBooking,
  updateAmenityBooking,
} from "@/lib/actions/resident/resident-amenities";
import { useToast } from "@/hooks/use-toast";

export default function AmenitiesPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "admin" | "resident";
}) {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    guests: 1,
    notes: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { toast } = useToast();

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

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      date: booking.booking_date,
      time: booking.time_slot,
      guests: booking.guests,
      notes: booking.notes || "",
    });
    setShowEditModal(true);
  };

  const handleCancelBooking = (booking) => {
    setCancellingBooking(booking);
    setShowCancelModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBooking(null);
    setEditForm({
      date: "",
      time: "",
      guests: 1,
      notes: "",
    });
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellingBooking(null);
  };

  const submitEdit = async () => {
    if (!editingBooking) return;

    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("date", editForm.date);
      formData.append("time", editForm.time);
      formData.append("guests", String(editForm.guests));
      formData.append("notes", editForm.notes);

      await updateAmenityBooking(editingBooking.id, formData);

      toast({
        title: "Booking Updated",
        description: "Your amenity booking has been updated successfully.",
      });

      closeEditModal();
      // Refresh bookings
      const bookingsData = await getMyAmenityBookings();
      setBookings(bookingsData);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update booking.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancellingBooking) return;

    setCancelLoading(true);
    try {
      await cancelAmenityBooking(cancellingBooking.id);

      toast({
        title: "Booking Cancelled",
        description: "Your amenity booking has been cancelled successfully.",
      });

      closeCancelModal();
      // Refresh bookings
      const bookingsData = await getMyAmenityBookings();
      setBookings(bookingsData);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <MainLayout userRole={userRole} userName={userName}>
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
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-3 text-center text-muted-foreground"
                            >
                              No bookings found.
                            </td>
                          </tr>
                        ) : (
                          bookings.map((b) => (
                            <tr key={b.id} className="border-b">
                              <td className="py-2">
                                {b.amenities?.name || "-"}
                              </td>
                              <td className="py-2">{b.booking_date}</td>
                              <td className="py-2">{b.time_slot}</td>
                              <td className="py-2">{b.guests}</td>
                              <td className="py-2">
                                <Badge
                                  variant={
                                    b.status === "approved"
                                      ? "default"
                                      : b.status === "pending"
                                      ? "outline"
                                      : b.status === "completed"
                                      ? "secondary"
                                      : b.status === "cancelled"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {b.status}
                                </Badge>
                              </td>
                              <td className="py-2">
                                <div className="flex space-x-2">
                                  {b.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditBooking(b)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleCancelBooking(b)}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {b.status === "approved" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleCancelBooking(b)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {(b.status === "completed" ||
                                    b.status === "cancelled" ||
                                    b.status === "rejected") && (
                                    <span className="text-sm text-muted-foreground">
                                      No actions available
                                    </span>
                                  )}
                                </div>
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

      {/* Edit Booking Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Amenity</Label>
                <p className="text-sm text-muted-foreground">
                  {editingBooking.amenities?.name}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time Slot</Label>
                  <select
                    id="edit-time"
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, time: e.target.value }))
                    }
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
              <div>
                <Label htmlFor="edit-guests">Number of Guests</Label>
                <Input
                  id="edit-guests"
                  type="number"
                  min="1"
                  max="20"
                  value={editForm.guests}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      guests: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Additional Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any special requests or information"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editLoading}>
              {editLoading ? "Updating..." : "Update Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          {cancellingBooking && (
            <div className="space-y-4">
              <p>
                Are you sure you want to cancel your booking for{" "}
                <strong>{cancellingBooking.amenities?.name}</strong> on{" "}
                <strong>{cancellingBooking.booking_date}</strong> at{" "}
                <strong>{cancellingBooking.time_slot}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. If your booking was already
                approved, please contact the admin if you need to reschedule.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelModal}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
