"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

// Get all visitor requests (Admin only)
export async function getAllVisitorRequests() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("visitors")
            .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch visitor requests: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching visitor requests:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch visitor requests")
    }
}

// Approve a visitor request (Admin only)
export async function approveVisitorRequest(requestId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("visitors")
            .update({
                status: "approved",
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to approve visitor request: ${error.message}`)
        }

        revalidatePath("/admin/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error approving visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to approve visitor request")
    }
}

// Reject a visitor request (Admin only)
export async function rejectVisitorRequest(requestId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("visitors")
            .update({
                status: "rejected",
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to reject visitor request: ${error.message}`)
        }

        revalidatePath("/admin/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error rejecting visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to reject visitor request")
    }
}

// Update a visitor request (Admin only)
export async function updateVisitorRequest(requestId: string, formData: FormData) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const visitorName = formData.get("visitorName") as string
        const visitDate = formData.get("visitDate") as string
        const timeIn = formData.get("timeIn") as string
        const reason = formData.get("reason") as string
        const vehicleInfo = formData.get("vehicleInfo") as string

        if (!visitorName || !visitDate || !timeIn || !reason) {
            throw new Error("Visitor name, date, time, and reason are required")
        }

        const { error } = await supabase
            .from("visitors")
            .update({
                visitor_name: visitorName,
                visit_date: visitDate,
                time_in: timeIn,
                reason,
                vehicle_info: vehicleInfo || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to update visitor request: ${error.message}`)
        }

        revalidatePath("/admin/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error updating visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update visitor request")
    }
}

// Delete a visitor request (Admin only)
export async function deleteVisitorRequest(requestId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("visitors")
            .delete()
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to delete visitor request: ${error.message}`)
        }

        revalidatePath("/admin/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error deleting visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete visitor request")
    }
}

// Get visitor statistics (Admin only)
export async function getVisitorStats() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("visitors")
            .select("status, created_at, visit_date")

        if (error) {
            throw new Error(`Failed to fetch visitor stats: ${error.message}`)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const stats = {
            totalVisitors: data?.length || 0,
            pendingVisitors: data?.filter((v) => v.status === "pending").length || 0,
            approvedVisitors: data?.filter((v) => v.status === "approved").length || 0,
            checkedInVisitors: data?.filter((v) => v.status === "checked-in").length || 0,
            checkedOutVisitors: data?.filter((v) => v.status === "checked-out").length || 0,
            cancelledVisitors: data?.filter((v) => v.status === "cancelled").length || 0,
            todayVisitors: data?.filter((v) => {
                const visitDate = new Date(v.visit_date)
                visitDate.setHours(0, 0, 0, 0)
                return visitDate.getTime() === today.getTime()
            }).length || 0,
        }

        return stats
    } catch (error) {
        console.error("Error fetching visitor stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch visitor statistics")
    }
} 