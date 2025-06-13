"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

// Authentication helper
async function getAuthenticatedAdmin() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
        throw new Error("Access denied. Admin role required.")
    }

    return { user, supabase: createServerSupabaseServiceClient() }
}

// Get all amenity bookings with details
export async function getAllAmenityBookings() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data: bookings, error } = await supabase
            .from("amenity_bookings")
            .select(`
        id,
        booking_date,
        time_slot,
        guests,
        notes,
        status,
        created_at,
        amenities (
          id,
          name,
          capacity,
          hourly_rate
        ),
        profiles (
          id,
          full_name,
          email,
          phone
        )
      `)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch amenity bookings: ${error.message}`)
        }

        return bookings || []
    } catch (error) {
        console.error("Error fetching amenity bookings:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenity bookings")
    }
}

// Approve amenity booking
export async function approveAmenityBooking(bookingId: string) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data, error } = await supabase
            .from("amenity_bookings")
            .update({
                status: "approved",
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .select()

        if (error) {
            throw new Error(`Failed to approve booking: ${error.message}`)
        }

        revalidatePath("/admin/amenities")
        return { success: true, data }
    } catch (error) {
        console.error("Error approving booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to approve booking")
    }
}

// Reject amenity booking
export async function rejectAmenityBooking(bookingId: string, reason?: string) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data, error } = await supabase
            .from("amenity_bookings")
            .update({
                status: "rejected",
                notes: reason ? `Rejected: ${reason}` : "Rejected by admin",
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .select()

        if (error) {
            throw new Error(`Failed to reject booking: ${error.message}`)
        }

        revalidatePath("/admin/amenities")
        return { success: true, data }
    } catch (error) {
        console.error("Error rejecting booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to reject booking")
    }
}

// Get all amenities
export async function getAllAmenities() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data: amenities, error } = await supabase.from("amenities").select("*").order("name")

        if (error) {
            throw new Error(`Failed to fetch amenities: ${error.message}`)
        }

        return amenities || []
    } catch (error) {
        console.error("Error fetching amenities:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenities")
    }
}

// Create new amenity
export async function createAmenity(formData: FormData) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const name = formData.get("name") as string
        const description = (formData.get("description") as string) || null
        const capacity = Number(formData.get("capacity")) || 1
        const hourlyRate = Number(formData.get("hourlyRate")) || 0
        const isActive = formData.get("isActive") !== "false"
        const requiresApproval = formData.get("requiresApproval") === "true"

        if (!name) {
            throw new Error("Amenity name is required")
        }

        const { data, error } = await supabase
            .from("amenities")
            .insert({
                name,
                description,
                capacity,
                hourly_rate: hourlyRate,
                is_active: isActive,
                requires_approval: requiresApproval,
            })
            .select()

        if (error) {
            throw new Error(`Failed to create amenity: ${error.message}`)
        }

        revalidatePath("/admin/amenities")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating amenity:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create amenity")
    }
}

// Update amenity
export async function updateAmenity(amenityId: string, formData: FormData) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const name = formData.get("name") as string
        const description = (formData.get("description") as string) || null
        const capacity = Number(formData.get("capacity")) || 1
        const hourlyRate = Number(formData.get("hourlyRate")) || 0
        const isActive = formData.get("isActive") !== "false"
        const requiresApproval = formData.get("requiresApproval") === "true"

        if (!name) {
            throw new Error("Amenity name is required")
        }

        const { data, error } = await supabase
            .from("amenities")
            .update({
                name,
                description,
                capacity,
                hourly_rate: hourlyRate,
                is_active: isActive,
                requires_approval: requiresApproval,
                updated_at: new Date().toISOString(),
            })
            .eq("id", amenityId)
            .select()

        if (error) {
            throw new Error(`Failed to update amenity: ${error.message}`)
        }

        revalidatePath("/admin/amenities")
        return { success: true, data }
    } catch (error) {
        console.error("Error updating amenity:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update amenity")
    }
}

// Delete amenity
export async function deleteAmenity(amenityId: string) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        // Check if there are any active bookings
        const { data: activeBookings } = await supabase
            .from("amenity_bookings")
            .select("id")
            .eq("amenity_id", amenityId)
            .in("status", ["pending", "approved"])

        if (activeBookings && activeBookings.length > 0) {
            throw new Error("Cannot delete amenity with active bookings")
        }

        const { error } = await supabase.from("amenities").delete().eq("id", amenityId)

        if (error) {
            throw new Error(`Failed to delete amenity: ${error.message}`)
        }

        revalidatePath("/admin/amenities")
        return { success: true }
    } catch (error) {
        console.error("Error deleting amenity:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete amenity")
    }
}

// Get amenity booking statistics
export async function getAmenityStats() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        // Get total bookings this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: totalBookings, error: totalError } = await supabase
            .from("amenity_bookings")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString())

        if (totalError) {
            throw new Error(`Failed to get total bookings: ${totalError.message}`)
        }

        // Get pending approvals
        const { count: pendingApprovals, error: pendingError } = await supabase
            .from("amenity_bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")

        if (pendingError) {
            throw new Error(`Failed to get pending approvals: ${pendingError.message}`)
        }

        // Get most popular amenity
        const { data: popularAmenity, error: popularError } = await supabase
            .from("amenity_bookings")
            .select(`
        amenity_id,
        amenities (name)
      `)
            .gte("created_at", startOfMonth.toISOString())

        if (popularError) {
            throw new Error(`Failed to get popular amenity: ${popularError.message}`)
        }

        // Count bookings per amenity
        const amenityCounts: Record<string, number> = {}
        popularAmenity?.forEach((booking: any) => {
            const amenityName = booking.amenities?.name
            if (amenityName) {
                amenityCounts[amenityName] = (amenityCounts[amenityName] || 0) + 1
            }
        })

        const mostPopular = Object.entries(amenityCounts).reduce(
            (a, b) => (amenityCounts[a[0]] > amenityCounts[b[0]] ? a : b),
            ["N/A", 0],
        )

        // Calculate revenue (simplified)
        const { data: revenueData, error: revenueError } = await supabase
            .from("amenity_bookings")
            .select(`
        amenities (hourly_rate)
      `)
            .eq("status", "approved")
            .gte("created_at", startOfMonth.toISOString())

        if (revenueError) {
            throw new Error(`Failed to get revenue data: ${revenueError.message}`)
        }

        const totalRevenue =
            revenueData?.reduce((sum, booking: any) => {
                return sum + (booking.amenities?.hourly_rate || 0)
            }, 0) || 0

        return {
            totalBookings: totalBookings || 0,
            pendingApprovals: pendingApprovals || 0,
            mostPopular: mostPopular[0],
            mostPopularCount: mostPopular[1],
            totalRevenue,
        }
    } catch (error) {
        console.error("Error fetching amenity stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenity statistics")
    }
}
