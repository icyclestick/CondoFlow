"use server"

import { revalidatePath } from "next/cache"
// import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createAmenityBooking(formData: FormData) {
  // const supabase = createServerSupabaseClient()

  // Get the current user session
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) {
  //   redirect('/auth/signin')
  // }

  const amenityId = formData.get("amenity") as string
  const date = formData.get("date") as string
  const timeSlot = formData.get("time") as string
  const guests = Number.parseInt(formData.get("guests") as string)
  const notes = formData.get("notes") as string

  try {
    // Insert the booking into Supabase
    // const { data, error } = await supabase
    //   .from('amenity_bookings')
    //   .insert({
    //     user_id: session.user.id,
    //     amenity_id: amenityId,
    //     booking_date: date,
    //     time_slot: timeSlot,
    //     guests: guests,
    //     notes: notes,
    //     status: 'pending'
    //   })
    //   .select()

    // if (error) {
    //   throw new Error(`Error creating booking: ${error.message}`)
    // }

    // For now, simulate success
    console.log("Booking created:", { amenityId, date, timeSlot, guests, notes })

    // Revalidate the amenities page to show the new booking
    revalidatePath("/resident/amenities")

    return { success: true, message: "Booking created successfully" }
  } catch (error) {
    console.error("Error creating booking:", error)
    throw new Error("Failed to create booking")
  }
}

export async function approveAmenityBooking(bookingId: string) {
  // const supabase = createServerSupabaseClient()

  try {
    // Update booking status to approved
    // const { error } = await supabase
    //   .from('amenity_bookings')
    //   .update({ status: 'approved' })
    //   .eq('id', bookingId)

    // if (error) {
    //   throw new Error(`Error approving booking: ${error.message}`)
    // }

    console.log("Booking approved:", bookingId)

    revalidatePath("/admin/amenities")
    return { success: true, message: "Booking approved successfully" }
  } catch (error) {
    console.error("Error approving booking:", error)
    throw new Error("Failed to approve booking")
  }
}

export async function rejectAmenityBooking(bookingId: string) {
  // const supabase = createServerSupabaseClient()

  try {
    // Update booking status to rejected
    // const { error } = await supabase
    //   .from('amenity_bookings')
    //   .update({ status: 'rejected' })
    //   .eq('id', bookingId)

    // if (error) {
    //   throw new Error(`Error rejecting booking: ${error.message}`)
    // }

    console.log("Booking rejected:", bookingId)

    revalidatePath("/admin/amenities")
    return { success: true, message: "Booking rejected successfully" }
  } catch (error) {
    console.error("Error rejecting booking:", error)
    throw new Error("Failed to reject booking")
  }
}
