"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Authentication & Authorization Helper
async function getAuthenticatedResident() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a resident
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "resident") {
        throw new Error("Access denied. Resident role required.")
    }

    return { user, supabase }
}

// Create a new visitor request
export async function createVisitorRequest(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const visitorName = formData.get("visitorName") as string
        const visitDate = formData.get("visitDate") as string
        const timeIn = formData.get("timeIn") as string
        const reason = formData.get("reason") as string
        const vehicleInfo = formData.get("vehicleInfo") as string

        if (!visitorName || !visitDate || !timeIn || !reason) {
            throw new Error("Visitor name, date, time, and reason are required")
        }

        const { data, error } = await supabase
            .from("visitors")
            .insert({
                user_id: user.id,
                visitor_name: visitorName,
                visit_date: visitDate,
                time_in: timeIn,
                reason,
                vehicle_info: vehicleInfo || null,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create visitor request: ${error.message}`)
        }

        revalidatePath("/resident/visitors")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create visitor request")
    }
}

// Get resident's own visitor requests
export async function getMyVisitorRequests() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("visitors")
            .select("*")
            .eq("user_id", user.id)
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

// Get resident's visitor request statistics
export async function getMyVisitorStats() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("visitors")
            .select("status, created_at, visit_date")
            .eq("user_id", user.id)

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

// Get a specific visitor request by ID (resident can only see their own)
export async function getMyVisitorRequestById(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("visitors")
            .select("*")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (error || !data) {
            throw new Error("Visitor request not found or access denied")
        }

        return data
    } catch (error) {
        console.error("Error fetching visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch visitor request")
    }
}

// Update a visitor request (resident can only update pending requests)
export async function updateMyVisitorRequest(requestId: string, formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user
        const { data: request, error: fetchError } = await supabase
            .from("visitors")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Visitor request not found or access denied")
        }

        // Residents can only update pending requests
        if (request.status !== "pending") {
            throw new Error("Cannot update visitor request that is no longer pending")
        }

        const visitorName = formData.get("visitorName") as string
        const visitDate = formData.get("visitDate") as string
        const timeIn = formData.get("timeIn") as string
        const reason = formData.get("reason") as string
        const vehicleInfo = formData.get("vehicleInfo") as string

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (visitorName) updateData.visitor_name = visitorName
        if (visitDate) updateData.visit_date = visitDate
        if (timeIn) updateData.time_in = timeIn
        if (reason) updateData.reason = reason
        if (vehicleInfo !== null) updateData.vehicle_info = vehicleInfo

        const { error } = await supabase
            .from("visitors")
            .update(updateData)
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to update visitor request: ${error.message}`)
        }

        revalidatePath("/resident/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error updating visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update visitor request")
    }
}

// Cancel a visitor request (resident can only cancel pending requests)
export async function cancelVisitorRequest(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user and is pending
        const { data: request, error: fetchError } = await supabase
            .from("visitors")
            .select("id, user_id, status, visit_date")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Visitor request not found or access denied")
        }

        if (request.status !== "pending") {
            throw new Error("Cannot cancel visitor request that is no longer pending")
        }

        // Check if visit is today or in the past
        const visitDate = new Date(request.visit_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (visitDate <= today) {
            throw new Error("Cannot cancel visitor request for today or past dates")
        }

        const { error } = await supabase
            .from("visitors")
            .delete()
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to cancel visitor request: ${error.message}`)
        }

        revalidatePath("/resident/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error canceling visitor request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to cancel visitor request")
    }
}

// Check out a visitor (resident can check out their own visitors)
export async function checkOutVisitor(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user and is checked in
        const { data: request, error: fetchError } = await supabase
            .from("visitors")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Visitor request not found or access denied")
        }

        if (request.status !== "checked-in") {
            throw new Error("Visitor must be checked in to check out")
        }

        const { error } = await supabase
            .from("visitors")
            .update({
                status: "checked-out",
                time_out: new Date().toTimeString().slice(0, 8),
                updated_at: new Date().toISOString(),
            })
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to check out visitor: ${error.message}`)
        }

        revalidatePath("/resident/visitors")
        return { success: true }
    } catch (error) {
        console.error("Error checking out visitor:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to check out visitor")
    }
} 