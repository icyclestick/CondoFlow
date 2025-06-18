"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Authentication & Authorization Helper
async function getAuthenticatedResident() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a resident
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "resident") {
        throw new Error("Access denied. Resident role required.")
    }

    return { user, supabase }
}

// Get all available amenities
export async function getAvailableAmenities() {
    const { supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("amenities")
            .select("*")
            .order("name")

        if (error) {
            throw new Error(`Failed to fetch amenities: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching amenities:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenities")
    }
}

// Create amenity booking
export async function createAmenityBooking(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const amenityId = formData.get("amenity") as string
        const bookingDate = formData.get("date") as string
        const timeSlot = formData.get("time") as string
        const guests = Number.parseInt(formData.get("guests") as string)
        const notes = formData.get("notes") as string

        if (!amenityId || !bookingDate || !timeSlot) {
            throw new Error("Amenity, date, and time are required")
        }

        // Check for conflicts
        const { data: existingBookings } = await supabase
            .from("amenity_bookings")
            .select("*")
            .eq("amenity_id", amenityId)
            .eq("booking_date", bookingDate)
            .eq("time_slot", timeSlot)
            .eq("status", "approved")

        if (existingBookings && existingBookings.length > 0) {
            throw new Error("This time slot is already booked")
        }

        // Create booking
        const { data, error } = await supabase
            .from("amenity_bookings")
            .insert({
                user_id: user.id,
                amenity_id: amenityId,
                booking_date: bookingDate,
                time_slot: timeSlot,
                guests: guests,
                notes: notes,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create booking: ${error.message}`)
        }

        revalidatePath("/resident/amenities")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating amenity booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create booking")
    }
}

// Get resident's own amenity bookings
export async function getMyAmenityBookings() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("amenity_bookings")
            .select(`
        *,
        amenities (
          id,
          name,
          description,
          hourly_rate
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch bookings: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching amenity bookings:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch bookings")
    }
}

// Get resident's amenity booking statistics
export async function getMyAmenityStats() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        // Get total bookings this month
        const { count: totalBookings } = await supabase
            .from("amenity_bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", startOfMonth.toISOString())

        // Get pending bookings
        const { count: pendingBookings } = await supabase
            .from("amenity_bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "pending")

        // Get approved bookings
        const { count: approvedBookings } = await supabase
            .from("amenity_bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "approved")

        return {
            totalBookings: totalBookings || 0,
            pendingBookings: pendingBookings || 0,
            approvedBookings: approvedBookings || 0,
        }
    } catch (error) {
        console.error("Error fetching amenity stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch amenity statistics")
    }
}

// Get a specific booking by ID (resident can only see their own)
export async function getMyBookingById(bookingId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("amenity_bookings")
            .select(`
        *,
        amenities (
          id,
          name,
          description,
          hourly_rate
        )
      `)
            .eq("id", bookingId)
            .eq("user_id", user.id)
            .single()

        if (error || !data) {
            throw new Error("Booking not found or access denied")
        }

        return data
    } catch (error) {
        console.error("Error fetching booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch booking")
    }
}

// Cancel a booking (resident can only cancel pending or approved bookings)
export async function cancelAmenityBooking(bookingId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the booking belongs to the current user
        const { data: booking, error: fetchError } = await supabase
            .from("amenity_bookings")
            .select("id, user_id, status, booking_date")
            .eq("id", bookingId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !booking) {
            throw new Error("Booking not found or access denied")
        }

        // Check if booking is in the future
        const bookingDate = new Date(booking.booking_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (bookingDate <= today) {
            throw new Error("Cannot cancel bookings for today or past dates")
        }

        // Residents can only cancel pending or approved bookings
        if (!["pending", "approved"].includes(booking.status)) {
            throw new Error("Cannot cancel booking that is already completed or rejected")
        }

        const { error } = await supabase
            .from("amenity_bookings")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to cancel booking: ${error.message}`)
        }

        revalidatePath("/resident/amenities")
        return { success: true }
    } catch (error) {
        console.error("Error canceling amenity booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to cancel booking")
    }
}

// Update a booking (resident can only update pending bookings)
export async function updateAmenityBooking(bookingId: string, formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the booking belongs to the current user
        const { data: booking, error: fetchError } = await supabase
            .from("amenity_bookings")
            .select("id, user_id, status")
            .eq("id", bookingId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !booking) {
            throw new Error("Booking not found or access denied")
        }

        // Residents can only update pending bookings
        if (booking.status !== "pending") {
            throw new Error("Cannot update booking that is no longer pending")
        }

        const timeSlot = formData.get("time") as string
        const guests = Number.parseInt(formData.get("guests") as string)
        const notes = formData.get("notes") as string

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (timeSlot) updateData.time_slot = timeSlot
        if (guests) updateData.guests = guests
        if (notes !== null) updateData.notes = notes

        const { error } = await supabase
            .from("amenity_bookings")
            .update(updateData)
            .eq("id", bookingId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to update booking: ${error.message}`)
        }

        revalidatePath("/resident/amenities")
        return { success: true }
    } catch (error) {
        console.error("Error updating amenity booking:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update booking")
    }
} 