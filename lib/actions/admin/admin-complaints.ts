"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

export async function getAllComplaints() {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        profiles!complaints_user_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch complaints: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error fetching complaints:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch complaints")
  }
}

export async function getComplaintStats() {
  const supabase = createServerSupabaseServiceClient()

  try {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("complaints")
      .select("status, created_at")
      .gte("created_at", currentMonth.toISOString())

    if (error) {
      throw new Error(`Failed to fetch complaint stats: ${error.message}`)
    }

    const stats = {
      totalComplaints: data?.length || 0,
      openComplaints: data?.filter((c) => c.status === "pending").length || 0,
      inProgressComplaints: data?.filter((c) => c.status === "in-progress").length || 0,
      resolvedComplaints: data?.filter((c) => c.status === "resolved").length || 0,
    }

    return stats
  } catch (error) {
    console.error("Error fetching complaint stats:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch complaint statistics")
  }
}

export async function updateComplaintStatus(complaintId: string, status: string, adminNotes?: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes) {
      updateData.admin_response = adminNotes
    }

    const { error } = await supabase.from("complaints").update(updateData).eq("id", complaintId)

    if (error) {
      throw new Error(`Failed to update complaint status: ${error.message}`)
    }

    revalidatePath("/admin/complaints")
  } catch (error) {
    console.error("Error updating complaint status:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update complaint status")
  }
}

export async function respondToComplaint(complaintId: string, response: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { error } = await supabase
      .from("complaints")
      .update({
        admin_response: response,
        status: "in-progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId)

    if (error) {
      throw new Error(`Failed to respond to complaint: ${error.message}`)
    }

    revalidatePath("/admin/complaints")
  } catch (error) {
    console.error("Error responding to complaint:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to respond to complaint")
  }
}

export async function deleteComplaint(complaintId: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { error } = await supabase.from("complaints").delete().eq("id", complaintId)

    if (error) {
      throw new Error(`Failed to delete complaint: ${error.message}`)
    }

    revalidatePath("/admin/complaints")
  } catch (error) {
    console.error("Error deleting complaint:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete complaint")
  }
}
