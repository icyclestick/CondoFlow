"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

export async function getAllGatepassRequests() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("gatepass_requests")
            .select(`
        *,
        profiles!gatepass_requests_resident_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch gatepass requests: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching gatepass requests:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch gatepass requests")
    }
}

export async function getGatepassStats() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
            .from("gatepass_requests")
            .select("status, created_at")
            .gte("created_at", currentMonth.toISOString())

        if (error) {
            throw new Error(`Failed to fetch gatepass stats: ${error.message}`)
        }

        const stats = {
            totalRequests: data?.length || 0,
            pendingRequests: data?.filter((r) => r.status === "pending").length || 0,
            approvedRequests: data?.filter((r) => r.status === "approved").length || 0,
            completedRequests: data?.filter((r) => r.status === "completed").length || 0,
        }

        return stats
    } catch (error) {
        console.error("Error fetching gatepass stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch gatepass statistics")
    }
}

export async function approveGatepassRequest(requestId: string, adminNotes?: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("gatepass_requests")
            .update({
                status: "approved",
                admin_notes: adminNotes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to approve gatepass request: ${error.message}`)
        }

        revalidatePath("/admin/gatepass")
    } catch (error) {
        console.error("Error approving gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to approve gatepass request")
    }
}

export async function rejectGatepassRequest(requestId: string, adminNotes?: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("gatepass_requests")
            .update({
                status: "rejected",
                admin_notes: adminNotes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to reject gatepass request: ${error.message}`)
        }

        revalidatePath("/admin/gatepass")
    } catch (error) {
        console.error("Error rejecting gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to reject gatepass request")
    }
}

export async function completeGatepassRequest(requestId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("gatepass_requests")
            .update({
                status: "completed",
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)

        if (error) {
            throw new Error(`Failed to complete gatepass request: ${error.message}`)
        }

        revalidatePath("/admin/gatepass")
    } catch (error) {
        console.error("Error completing gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to complete gatepass request")
    }
}
