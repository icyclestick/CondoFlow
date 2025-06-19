"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

export async function getAllMoveRequests() {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { data, error } = await supabase
      .from("move_requests")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone
        ),
        units!move_requests_unit_id_fkey (
          id,
          block,
          unit_number
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch move requests: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error fetching move requests:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch move requests")
  }
}

export async function getMoveRequestStats() {
  const supabase = createServerSupabaseServiceClient()

  try {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("move_requests")
      .select("type, status, created_at")
      .gte("created_at", currentMonth.toISOString())

    if (error) {
      throw new Error(`Failed to fetch move request stats: ${error.message}`)
    }

    const stats = {
      totalRequests: data?.length || 0,
      pendingRequests: data?.filter((r) => r.status === "pending").length || 0,
      moveIns: data?.filter((r) => r.type === "move-in").length || 0,
      moveOuts: data?.filter((r) => r.type === "move-out").length || 0,
    }

    return stats
  } catch (error) {
    console.error("Error fetching move request stats:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch move request statistics")
  }
}

export async function approveMoveRequest(requestId: string, adminNotes?: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { error } = await supabase
      .from("move_requests")
      .update({
        status: "approved",
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      throw new Error(`Failed to approve move request: ${error.message}`)
    }

    revalidatePath("/admin/move-requests")
  } catch (error) {
    console.error("Error approving move request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to approve move request")
  }
}

export async function rejectMoveRequest(requestId: string, adminNotes?: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { error } = await supabase
      .from("move_requests")
      .update({
        status: "rejected",
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      throw new Error(`Failed to reject move request: ${error.message}`)
    }

    revalidatePath("/admin/move-requests")
  } catch (error) {
    console.error("Error rejecting move request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to reject move request")
  }
}

export async function completeMoveRequest(requestId: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { error } = await supabase
      .from("move_requests")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      throw new Error(`Failed to complete move request: ${error.message}`)
    }

    revalidatePath("/admin/move-requests")
  } catch (error) {
    console.error("Error completing move request:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to complete move request")
  }
}

// Alias function for backward compatibility
export async function updateMoveRequestStatus(requestId: string, status: string, adminNotes?: string) {
  switch (status) {
    case "approved":
      return approveMoveRequest(requestId, adminNotes)
    case "rejected":
      return rejectMoveRequest(requestId, adminNotes)
    case "completed":
      return completeMoveRequest(requestId)
    default:
      throw new Error(`Invalid status: ${status}`)
  }
}
