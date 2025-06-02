"use server"

import { revalidatePath } from "next/cache"
// import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createVisitorRequest(formData: FormData) {
  // const supabase = createServerSupabaseClient()

  const visitorName = formData.get("visitorName") as string
  const visitDate = formData.get("visitDate") as string
  const timeIn = formData.get("timeIn") as string
  const timeOut = formData.get("timeOut") as string
  const reason = formData.get("reason") as string
  const vehicleInfo = formData.get("vehicleInfo") as string
  const additionalNotes = formData.get("additionalNotes") as string

  try {
    // Insert the visitor request into Supabase
    // const { data, error } = await supabase
    //   .from('visitors')
    //   .insert({
    //     user_id: session.user.id,
    //     visitor_name: visitorName,
    //     visit_date: visitDate,
    //     time_in: timeIn,
    //     time_out: timeOut,
    //     reason: reason,
    //     vehicle_info: vehicleInfo,
    //     status: 'pending'
    //   })
    //   .select()

    console.log("Visitor registered:", { visitorName, visitDate, timeIn, timeOut, reason })

    revalidatePath("/resident/visitors")
    return { success: true, message: "Visitor registered successfully" }
  } catch (error) {
    console.error("Error registering visitor:", error)
    throw new Error("Failed to register visitor")
  }
}
