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

// Get amenity statistics
export async function getAmenityStats() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const { data: bookings, error } = await supabase
            .from("amenity_bookings")
            .select("status, created_at")
            .gte("created_at", currentMonth.toISOString())

        if (error) {
            throw new Error(`Failed to fetch amenity stats: ${error.message}`)
        }

        const stats = {
            totalBookings: bookings?.length || 0,
            pendingBookings: bookings?.filter((b) => b.status === "pending").length || 0,
            approvedBookings: bookings?.filter((b) => b.status === "approved").length || 0,
            rejectedBookings: bookings?.filter((b) => b.status === "rejected").length || 0,
        }

        return stats
    } catch (error) {
        console.error("Error fetching amenity stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenity statistics")
    }
}

// Alias functions for backward compatibility
export const approveBooking = approveAmenityBooking
export const rejectBooking = rejectAmenityBooking
