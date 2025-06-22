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

// Update a service request (resident can only update pending requests)
export async function updateServiceRequest(requestId: string, formData: FormData) {
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
    // Verify the request belongs to the current user and is pending
    const { data: request, error: fetchError } = await supabase
      .from("service_requests")
      .select("id, user_id, status")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !request) {
      throw new Error("Service request not found or access denied")
    }

    // Residents can only update pending requests
    if (request.status !== "pending") {
      throw new Error("Cannot update service request that is no longer pending")
    }

    const serviceType = formData.get("serviceType") as string
    const preferredSchedule = formData.get("preferredSchedule") as string
    const urgency = formData.get("urgency") as string
    const description = formData.get("description") as string

    if (!serviceType || !preferredSchedule || !urgency || !description) {
      throw new Error("Service type, preferred schedule, urgency, and description are required")
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update({
        service_type: serviceType,
        preferred_schedule: preferredSchedule,
        urgency: urgency,
        description: description,
      })
      .eq("id", requestId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update service request: ${error.message}`)
    }

    revalidatePath("/resident/services")
    return { success: true, data }
  } catch (error) {
    console.error("Error updating service request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update service request")
  }
}
