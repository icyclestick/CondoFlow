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

// Create a new gatepass request
export async function createGatepassRequest(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const transportDate = formData.get("transportDate") as string
        const transportTime = formData.get("transportTime") as string
        const reason = formData.get("reason") as string
        const items = formData.get("items") as string // JSON stringified array of items
        const notes = formData.get("notes") as string

        if (!transportDate || !transportTime || !reason || !items) {
            throw new Error("Transport date, time, reason, and items are required")
        }

        const { data, error } = await supabase
            .from("gatepass_requests")
            .insert({
                user_id: user.id,
                transport_date: transportDate,
                transport_time: transportTime,
                reason,
                items,
                notes: notes || null,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create gatepass request: ${error.message}`)
        }

        revalidatePath("/resident/gatepass")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create gatepass request")
    }
}

// Get resident's own gatepass requests
export async function getMyGatepassRequests() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("gatepass_requests")
            .select("*")
            .eq("user_id", user.id)
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

// Cancel a gatepass request (resident can only cancel pending requests)
export async function cancelGatepassRequest(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user
        const { data: request, error: fetchError } = await supabase
            .from("gatepass_requests")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Gatepass request not found or access denied")
        }

        // Residents can only cancel pending requests
        if (request.status !== "pending") {
            throw new Error("Cannot cancel gatepass request that is no longer pending")
        }

        const { error } = await supabase
            .from("gatepass_requests")
            .update({
                status: "cancelled",
            })
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to cancel gatepass request: ${error.message}`)
        }

        revalidatePath("/resident/gatepass")
        return { success: true }
    } catch (error) {
        console.error("Error canceling gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to cancel gatepass request")
    }
}

// Update a gatepass request (resident can only update pending requests)
export async function updateGatepassRequest(requestId: string, formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user and is pending
        const { data: request, error: fetchError } = await supabase
            .from("gatepass_requests")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Gatepass request not found or access denied")
        }

        // Residents can only update pending requests
        if (request.status !== "pending") {
            throw new Error("Cannot update gatepass request that is no longer pending")
        }

        const transportDate = formData.get("transportDate") as string
        const transportTime = formData.get("transportTime") as string
        const reason = formData.get("reason") as string
        const items = formData.get("items") as string // JSON stringified array of items
        const notes = formData.get("notes") as string

        if (!transportDate || !transportTime || !reason || !items) {
            throw new Error("Transport date, time, reason, and items are required")
        }

        const { data, error } = await supabase
            .from("gatepass_requests")
            .update({
                transport_date: transportDate,
                transport_time: transportTime,
                reason,
                items,
                notes: notes || null,
                // Keep the original created_at timestamp
                // updated_at will be automatically updated by the database trigger
            })
            .eq("id", requestId)
            .eq("user_id", user.id)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update gatepass request: ${error.message}`)
        }

        revalidatePath("/resident/gatepass")
        return { success: true, data }
    } catch (error) {
        console.error("Error updating gatepass request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update gatepass request")
    }
} 