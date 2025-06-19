"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// This file is for RESIDENT-facing service request functionality

export async function createServiceRequest(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  const serviceType = formData.get("serviceType") as string
  const preferredSchedule = formData.get("preferredSchedule") as string
  const urgency = formData.get("urgency") as string
  const description = formData.get("description") as string

  try {
    // Insert the service request into Supabase
    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        user_id: user.id,
        service_type: serviceType,
        preferred_schedule: preferredSchedule,
        urgency: urgency,
        description: description,
        status: "pending",
      })
      .select()

    if (error) {
      throw new Error(`Failed to create service request: ${error.message}`)
    }

    console.log("Service request created:", data)

    revalidatePath("/resident/services")
    return { success: true, message: "Service request created successfully", data }
  } catch (error) {
    console.error("Error creating service request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create service request")
  }
}

export async function getMyServiceRequests() {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch service requests: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error fetching service requests:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch service requests")
  }
}

export async function cancelServiceRequest(requestId: string) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabase
      .from("service_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("user_id", user.id) // Ensure user can only cancel their own requests

    if (error) {
      throw new Error(`Failed to cancel service request: ${error.message}`)
    }

    revalidatePath("/resident/services")
  } catch (error) {
    console.error("Error cancelling service request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to cancel service request")
  }
}
