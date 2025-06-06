"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function createAmenityBooking(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

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
      user_id: user.id,
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
  const supabase = await createServerSupabaseClient()

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
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from("amenity_bookings").update({ status: "approved" }).eq("id", bookingId)

  if (error) {
    throw new Error(`Failed to approve booking: ${error.message}`)
  }

  revalidatePath("/admin/amenities")
  return { success: true }
}
