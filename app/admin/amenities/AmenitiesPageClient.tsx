"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Calendar, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllAmenityBookings,
  getAmenityStats,
  approveBooking,
  rejectBooking,
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as UiCalendar } from "@/components/ui/calendar";

interface AmenityBooking {
  id: string;
  booking_date: string;
  time_slot: string;
  guests: number;
  status: string;
  created_at: string;
  amenities: {
    name: string;
  };
  profiles: {
    full_name: string;
  };
}

interface Amenity {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hourly_rate: number;
  is_active: boolean;
  image_url?: string;
}

interface AmenityStats {
  totalBookings: number;
  pendingBookings: number;
  mostPopularAmenity: string;
  totalRevenue: number;
}

export default function AmenitiesPageClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [stats, setStats] = useState<AmenityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const { toast } = useToast();
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: 1,
    hourly_rate: 0,
    image_url: "",
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showViewBookingModal, setShowViewBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AmenityBooking | null>(
    null
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAmenityForSchedule, setSelectedAmenityForSchedule] =
    useState<Amenity | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<Amenity | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, amenitiesData, statsData] = await Promise.all([
        getAllAmenityBookings(),
        getAllAmenities(),
        getAmenityStats(),
      ]);

      setBookings(
        bookingsData.map((b: any) => ({
          ...b,
          amenities: Array.isArray(b.amenities)
            ? b.amenities[0] || { name: "" }
            : b.amenities || { name: "" },
          profiles: Array.isArray(b.profiles)
            ? b.profiles[0] || { full_name: "" }
            : b.profiles || { full_name: "" },
        }))
      );
      setAmenities(amenitiesData);
      setStats({
        totalBookings: statsData.totalBookings ?? 0,
        pendingBookings: statsData.pendingBookings ?? 0,
        mostPopularAmenity:
          "mostPopularAmenity" in statsData
            ? String(statsData.mostPopularAmenity)
            : "N/A",
        totalRevenue:
          "totalRevenue" in statsData ? Number(statsData.totalRevenue) : 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await approveBooking(bookingId);
      toast({
        title: "Booking Approved",
        description: "The amenity booking has been approved successfully.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve booking.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await rejectBooking(bookingId);
      toast({
        title: "Booking Rejected",
        description: "The amenity booking has been rejected.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject booking.",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !searchTerm ||
      booking.profiles.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.amenities.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || booking.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openAddAmenity = () => {
    setEditingAmenity(null);
    setForm({
      name: "",
      description: "",
      capacity: 1,
      hourly_rate: 0,
      image_url: "",
      is_active: true,
    });
    setShowAmenityModal(true);
  };

  const openEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setForm({
      name: amenity.name,
      description: amenity.description || "",
      capacity: amenity.capacity,
      hourly_rate: amenity.hourly_rate,
      image_url: amenity.image_url || "",
      is_active: amenity.is_active,
    });
    setShowAmenityModal(true);
  };

  const closeAmenityModal = () => {
    setShowAmenityModal(false);
    setEditingAmenity(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAmenitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", form.name);
      formData.set("description", form.description);
      formData.set("capacity", String(form.capacity));
      formData.set("hourlyRate", String(form.hourly_rate));
      formData.set("image_url", form.image_url);
      formData.set("isActive", String(form.is_active));
      if (editingAmenity) {
        await updateAmenity(editingAmenity.id, formData);
        toast({ title: "Amenity updated" });
      } else {
        await createAmenity(formData);
        toast({ title: "Amenity created" });
      }
      closeAmenityModal();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save amenity.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Get all booking dates as Date objects
  const bookingDates = bookings.map((b) => new Date(b.booking_date));
  // Get bookings for the selected date
  const bookingsForSelectedDate = selectedDate
    ? bookings.filter(
        (b) =>
          new Date(b.booking_date).toDateString() ===
          selectedDate.toDateString()
      )
    : [];

  // Get bookings for the selected amenity and date
  const bookingsForAmenityAndDate =
    scheduleDate && selectedAmenityForSchedule
      ? bookings.filter(
          (b) =>
            new Date(b.booking_date).toDateString() ===
              scheduleDate.toDateString() &&
            b.amenities.name === selectedAmenityForSchedule.name
        )
      : [];

  // Get all booking dates for the selected amenity
  const amenityBookingDates = selectedAmenityForSchedule
    ? bookings
        .filter((b) => b.amenities.name === selectedAmenityForSchedule.name)
        .map((b) => new Date(b.booking_date))
    : [];

  const handleViewBooking = (booking: AmenityBooking) => {
    setSelectedBooking(booking);
    setShowViewBookingModal(true);
  };

  const closeViewBookingModal = () => {
    setShowViewBookingModal(false);
    setSelectedBooking(null);
  };

  const handleViewSchedule = (amenity: Amenity) => {
    setSelectedAmenityForSchedule(amenity);
    setScheduleDate(undefined);
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedAmenityForSchedule(null);
    setScheduleDate(undefined);
  };

  const handleDeleteAmenity = (amenity: Amenity) => {
    setAmenityToDelete(amenity);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAmenityToDelete(null);
  };

  const confirmDeleteAmenity = async () => {
    if (!amenityToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteAmenity(amenityToDelete.id);
      toast({
        title: "Amenity Deleted",
        description: `${amenityToDelete.name} has been deleted successfully.`,
      });
      closeDeleteModal();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete amenity.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout
        userRole={userRole as "admin" | "resident"}
        userName={userName}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading amenities data...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole as "admin" | "resident"} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Amenity Management
            </h1>
            <p className="text-muted-foreground">
              Manage amenity bookings and availability
            </p>
          </div>
          <Button onClick={openAddAmenity}>
            <Plus className="mr-2 h-4 w-4" />
            Add Amenity
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalBookings || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingBookings || 0}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Popular
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.mostPopularAmenity || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Most booked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue || 0}
              </div>
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
                <CardDescription>
                  Manage and approve amenity booking requests
                </CardDescription>
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
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No bookings found
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => (
                          <tr key={booking.id} className="border-b">
                            <td className="py-3">
                              {booking.profiles.full_name}
                            </td>
                            <td className="py-3">{booking.amenities.name}</td>
                            <td className="py-3">
                              {formatDate(booking.booking_date)}
                            </td>
                            <td className="py-3">{booking.time_slot}</td>
                            <td className="py-3">{booking.guests}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  booking.status === "approved"
                                    ? "default"
                                    : booking.status === "pending"
                                    ? "outline"
                                    : booking.status === "completed"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewBooking(booking)}
                                >
                                  View
                                </Button>
                                {booking.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(booking.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(booking.id)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
                <CardDescription>
                  Manage amenity details and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((amenity) => (
                    <Card key={amenity.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {amenity.name}
                        </CardTitle>
                        <Badge
                          variant={amenity.is_active ? "default" : "secondary"}
                        >
                          {amenity.is_active ? "Available" : "Inactive"}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Capacity:</strong> {amenity.capacity} people
                          </p>
                          <p className="text-sm">
                            <strong>Rate:</strong> ${amenity.hourly_rate}/hour
                          </p>
                          {amenity.description && (
                            <p className="text-sm text-muted-foreground">
                              {amenity.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditAmenity(amenity)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSchedule(amenity)}
                          >
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAmenity(amenity)}
                          >
                            Delete
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
                <CardDescription>
                  View amenity booking schedule and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div>
                    <UiCalendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      modifiers={{ booked: bookingDates }}
                      modifiersClassNames={{ booked: "bg-primary/20" }}
                    />
                  </div>
                  <div className="flex-1">
                    {selectedDate ? (
                      <>
                        <h3 className="font-semibold mb-2">
                          Bookings for {selectedDate.toLocaleDateString()}
                        </h3>
                        {bookingsForSelectedDate.length === 0 ? (
                          <div className="text-muted-foreground">
                            No bookings for this day.
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {bookingsForSelectedDate.map((b) => (
                              <li key={b.id} className="border rounded p-2">
                                <div>
                                  <strong>Amenity:</strong> {b.amenities.name}
                                </div>
                                <div>
                                  <strong>Time:</strong> {b.time_slot}
                                </div>
                                <div>
                                  <strong>Resident:</strong>{" "}
                                  {b.profiles.full_name}
                                </div>
                                <div>
                                  <strong>Status:</strong>{" "}
                                  <Badge>{b.status}</Badge>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        Select a date to view bookings.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAmenityModal} onOpenChange={setShowAmenityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAmenity ? "Edit Amenity" : "Add Amenity"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAmenitySubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min={0}
                step="0.01"
                value={form.hourly_rate}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleFormChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleFormChange}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeAmenityModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading
                  ? "Saving..."
                  : editingAmenity
                  ? "Save Changes"
                  : "Add Amenity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showViewBookingModal}
        onOpenChange={setShowViewBookingModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Resident</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.profiles.full_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amenity</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.amenities.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedBooking.booking_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time Slot</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.time_slot}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Number of Guests
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.guests}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedBooking.status === "approved"
                          ? "default"
                          : selectedBooking.status === "pending"
                          ? "outline"
                          : selectedBooking.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeViewBookingModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Schedule for {selectedAmenityForSchedule?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAmenityForSchedule && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Calendar View</h3>
                  <UiCalendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    modifiers={{ booked: amenityBookingDates }}
                    modifiersClassNames={{ booked: "bg-primary/20" }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Amenity Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Capacity:</strong>{" "}
                      {selectedAmenityForSchedule.capacity} people
                    </p>
                    <p>
                      <strong>Rate:</strong> $
                      {selectedAmenityForSchedule.hourly_rate}/hour
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        variant={
                          selectedAmenityForSchedule.is_active
                            ? "default"
                            : "secondary"
                        }
                        className="ml-2"
                      >
                        {selectedAmenityForSchedule.is_active
                          ? "Available"
                          : "Inactive"}
                      </Badge>
                    </p>
                    {selectedAmenityForSchedule.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {selectedAmenityForSchedule.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {scheduleDate && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Bookings for {scheduleDate.toLocaleDateString()}
                  </h3>
                  {bookingsForAmenityAndDate.length === 0 ? (
                    <div className="text-muted-foreground">
                      No bookings for this day.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookingsForAmenityAndDate.map((booking) => (
                        <div key={booking.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{booking.time_slot}</p>
                              <p className="text-sm text-muted-foreground">
                                Resident: {booking.profiles.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Guests: {booking.guests}
                              </p>
                            </div>
                            <Badge
                              variant={
                                booking.status === "approved"
                                  ? "default"
                                  : booking.status === "pending"
                                  ? "outline"
                                  : booking.status === "completed"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeScheduleModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Amenity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{amenityToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. If there are active bookings for
              this amenity, the deletion will be prevented.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAmenity}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
