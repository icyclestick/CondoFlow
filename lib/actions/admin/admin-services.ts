"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

// Authentication helper
async function getAuthenticatedAdmin() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
        throw new Error("Access denied. Admin role required.")
    }

    return { user, supabase: createServerSupabaseServiceClient() }
}

// Get all service requests
export async function getAllServiceRequests() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data: requests, error } = await supabase
            .from("service_requests")
            .select(`
        id,
        service_type,
        description,
        urgency,
        status,
        preferred_schedule,
        assigned_to,
        created_at,
        profiles (
          id,
          full_name,
          email,
          phone
        )
      `)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch service requests: ${error.message}`)
        }

        return requests || []
    } catch (error) {
        console.error("Error fetching service requests:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch service requests")
    }
}

// Assign technician to service request
export async function assignServiceRequest(requestId: string, technicianName: string) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const { data, error } = await supabase
            .from("service_requests")
            .update({
                assigned_to: technicianName,
                status: "assigned",
            })
            .eq("id", requestId)
            .select()

        if (error) {
            throw new Error(`Failed to assign service request: ${error.message}`)
        }

        revalidatePath("/admin/services")
        return { success: true, data }
    } catch (error) {
        console.error("Error assigning service request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to assign service request")
    }
}

// Update service request status
export async function updateServiceRequestStatus(requestId: string, status: string, notes?: string) {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        const updateData: any = {
            status,
        }

        if (notes) {
            updateData.admin_notes = notes
        }

        const { data, error } = await supabase.from("service_requests").update(updateData).eq("id", requestId).select()

        if (error) {
            throw new Error(`Failed to update service request: ${error.message}`)
        }

        revalidatePath("/admin/services")
        return { success: true, data }
    } catch (error) {
        console.error("Error updating service request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update service request")
    }
}

// Get service request statistics
export async function getServiceStats() {
    const { supabase } = await getAuthenticatedAdmin()

    try {
        // Get total requests this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: totalRequests, error: totalError } = await supabase
            .from("service_requests")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString())

        if (totalError) {
            throw new Error(`Failed to get total requests: ${totalError.message}`)
        }

        // Get pending requests
        const { count: pendingRequests, error: pendingError } = await supabase
            .from("service_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")

        if (pendingError) {
            throw new Error(`Failed to get pending requests: ${pendingError.message}`)
        }

        // Get in-progress requests
        const { count: inProgressRequests, error: progressError } = await supabase
            .from("service_requests")
            .select("*", { count: "exact", head: true })
            .in("status", ["assigned", "in-progress"])

        if (progressError) {
            throw new Error(`Failed to get in-progress requests: ${progressError.message}`)
        }

        // Get emergency requests
        const { count: emergencyRequests, error: emergencyError } = await supabase
            .from("service_requests")
            .select("*", { count: "exact", head: true })
            .eq("urgency", "emergency")
            .neq("status", "completed")

        if (emergencyError) {
            throw new Error(`Failed to get emergency requests: ${emergencyError.message}`)
        }

        return {
            totalRequests: totalRequests || 0,
            pendingRequests: pendingRequests || 0,
            inProgressRequests: inProgressRequests || 0,
            emergencyRequests: emergencyRequests || 0,
        }
    } catch (error) {
        console.error("Error fetching service stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch service statistics")
    }
}

// Alias function for backward compatibility
export const getServiceRequestStats = getServiceStats
