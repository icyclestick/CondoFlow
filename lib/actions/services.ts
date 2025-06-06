"use server"

import { revalidatePath } from "next/cache"
// import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createServiceRequest(formData: FormData) {
  // const supabase = createServerSupabaseClient()

  const serviceType = formData.get("serviceType") as string
  const preferredSchedule = formData.get("preferredSchedule") as string
  const urgency = formData.get("urgency") as string
  const description = formData.get("description") as string

  try {
    // Insert the service request into Supabase
    // const { data, error } = await supabase
    //   .from('service_requests')
    //   .insert({
    //     user_id: session.user.id,
    //     service_type: serviceType,
    //     preferred_schedule: preferredSchedule,
    //     urgency: urgency,
    //     description: description,
    //     status: 'pending'
    //   })
    //   .select()

    console.log("Service request created:", { serviceType, preferredSchedule, urgency, description })

    revalidatePath("/resident/services")
    return { success: true, message: "Service request created successfully" }
  } catch (error) {
    console.error("Error creating service request:", error)
    throw new Error("Failed to create service request")
  }
}
