import { MainLayout } from "@/components/main-layout";
import {
  getResidentStats,
  getAmenityStats,
  getMoveRequestStats,
  getGatepassStats,
  getComplaintStats,
  getPaymentStats,
  getOwnershipStats,
  getAllAmenityBookings,
  getAllMoveRequests,
  getAllGatepassRequests,
} from "@/lib/actions";
import { getCurrentUserProfile } from "@/lib/actions/shared/profile";
import AdminDashboardClient from "@/components/admin-dashboard-client";

export default async function AdminDashboard() {
  const profile = await getCurrentUserProfile();
  const [
    residentStats,
    amenityStats,
    moveRequestStats,
    gatepassStats,
    complaintStats,
    paymentStats,
    ownershipStats,
    amenityBookingsRaw,
    moveRequestsRaw,
    gatepassRequestsRaw,
  ] = await Promise.all([
    getResidentStats(),
    getAmenityStats(),
    getMoveRequestStats(),
    getGatepassStats(),
    getComplaintStats(),
    getPaymentStats(),
    getOwnershipStats(),
    getAllAmenityBookings(),
    getAllMoveRequests(),
    getAllGatepassRequests(),
  ]);

  const stats = {
    residents: {
      totalResidents: residentStats.totalResidents,
      activeResidents: residentStats.activeResidents,
      inactiveResidents: residentStats.inactiveResidents,
    },
    payments: {
      totalRevenue: paymentStats.totalRevenue,
      outstandingAmount: paymentStats.outstandingAmount,
      collectionRate: paymentStats.collectionRate,
      overdueAmount: paymentStats.overdueAmount,
      outstandingCount: paymentStats.outstandingCount,
      overdueCount: paymentStats.overdueCount,
    },
    moveRequests: {
      pendingRequests: moveRequestStats.pendingRequests,
    },
    complaints: {
      openComplaints: complaintStats.openComplaints,
    },
    ownership: {
      totalOwnedUnits: ownershipStats.totalOwnedUnits,
      ownerOccupied: ownershipStats.ownerOccupied,
      investmentProperties: ownershipStats.investmentProperties,
    },
  };

  // Map amenity bookings to dashboard shape
  const amenityBookings = (amenityBookingsRaw || []).map((b: any) => ({
    id: b.id,
    resident: b.profiles?.full_name || "-",
    amenity: b.amenities?.name || "-",
    date: b.booking_date ? new Date(b.booking_date).toLocaleDateString() : "-",
    status: b.status
      ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
      : "-",
  }));
  // Map move requests to dashboard shape
  const moveRequests = (moveRequestsRaw || []).map((r: any) => ({
    id: r.id,
    resident: r.profiles?.full_name || "-",
    type: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : "-",
    unit: r.units ? `${r.units.block}, #${r.units.unit_number}` : "-",
    date: r.move_date ? new Date(r.move_date).toLocaleDateString() : "-",
    status: r.status
      ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
      : "-",
  }));
  // Map gatepass requests to dashboard shape
  const gatepassRequests = (gatepassRequestsRaw || []).map((g: any) => {
    // Parse and format items
    let formattedItems = "-";
    if (g.items) {
      try {
        const itemsArray =
          typeof g.items === "string" ? JSON.parse(g.items) : g.items;
        if (Array.isArray(itemsArray)) {
          formattedItems = itemsArray
            .map((item: any) => `${item.name} (${item.quantity})`)
            .join(", ");
        }
      } catch (error) {
        console.error("Error parsing gatepass items:", error);
        formattedItems = g.items; // Fallback to raw string if parsing fails
      }
    }

    return {
      id: g.id,
      resident: g.profiles?.full_name || "-",
      items: formattedItems,
      date: g.transport_date
        ? new Date(g.transport_date).toLocaleDateString()
        : "-",
      status: g.status
        ? g.status.charAt(0).toUpperCase() + g.status.slice(1)
        : "-",
    };
  });

  return (
    <MainLayout userRole={profile.role} userName={profile.full_name}>
      <AdminDashboardClient
        stats={stats}
        amenityBookings={amenityBookings}
        moveRequests={moveRequests}
        gatepassRequests={gatepassRequests}
      />
    </MainLayout>
  );
}
