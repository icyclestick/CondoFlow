"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

export async function createAmenityBooking(formData: FormData) {
  const supabase = createServerSupabaseServiceClient()

  const amenityId = formData.get("amenity") as string
  const bookingDate = formData.get("date") as string
  const timeSlot = formData.get("time") as string
  const guests = Number.parseInt(formData.get("guests") as string)
  const notes = formData.get("notes") as string

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
      amenity_id: amenityId,
      booking_date: bookingDate,
      time_slot: timeSlot,
      guests: guests,
      notes: notes,
      status: "pending",
    })
    .select()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  revalidatePath("/resident/amenities")
  return { success: true, data }
}

export async function getAmenityBookings(userId?: string) {
  const supabase = createServerSupabaseServiceClient()

  let query = supabase
    .from("amenity_bookings")
    .select(`
      *,
      amenities (name),
      profiles (full_name)
    `)
    .order("created_at", { ascending: false })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return data
}

export async function approveAmenityBooking(bookingId: string) {
  const supabase = createServerSupabaseServiceClient()

  const { error } = await supabase.from("amenity_bookings").update({ status: "approved" }).eq("id", bookingId)

  if (error) {
    throw new Error(`Failed to approve booking: ${error.message}`)
  }

  revalidatePath("/admin/amenities")
  return { success: true }
}

export async function getAllAmenities() {
  const supabase = createServerSupabaseServiceClient()

  const { data, error } = await supabase.from("amenities").select("*").order("name")

  if (error) {
    throw new Error(`Failed to fetch amenities: ${error.message}`)
  }

  return data || []
}

export async function getAmenityStats() {
  const supabase = createServerSupabaseServiceClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Get total bookings this month
  const { count: totalBookings } = await supabase
    .from("amenity_bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Get pending bookings
  const { count: pendingBookings } = await supabase
    .from("amenity_bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get most popular amenity
  const { data: bookingData } = await supabase
    .from("amenity_bookings")
    .select(`
      amenities (name)
    `)
    .gte("created_at", startOfMonth.toISOString())

  const amenityCounts: Record<string, number> = {}
  bookingData?.forEach((booking: any) => {
    const name = booking.amenities?.name
    if (name) {
      amenityCounts[name] = (amenityCounts[name] || 0) + 1
    }
  })

  const mostPopular = Object.entries(amenityCounts).reduce(
    (a, b) => (amenityCounts[a[0]] > amenityCounts[b[0]] ? a : b),
    ["N/A", 0],
  )

  // Calculate revenue
  const { data: revenueData } = await supabase
    .from("amenity_bookings")
    .select(`
      amenities (hourly_rate)
    `)
    .eq("status", "approved")
    .gte("created_at", startOfMonth.toISOString())

  const totalRevenue =
    revenueData?.reduce((sum, booking: any) => {
      return sum + (booking.amenities?.hourly_rate || 0)
    }, 0) || 0

  return {
    totalBookings: totalBookings || 0,
    pendingBookings: pendingBookings || 0,
    mostPopularAmenity: mostPopular[0],
    totalRevenue,
  }
}

export async function rejectAmenityBooking(bookingId: string) {
  const supabase = createServerSupabaseServiceClient()

  const { error } = await supabase.from("amenity_bookings").update({ status: "rejected" }).eq("id", bookingId)

  if (error) {
    throw new Error(`Failed to reject booking: ${error.message}`)
  }

  revalidatePath("/admin/amenities")
  return { success: true }
}
