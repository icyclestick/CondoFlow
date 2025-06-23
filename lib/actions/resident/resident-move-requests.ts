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

// Create a new move request
export async function createMoveRequest(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const type = formData.get("type") as string
        const moveDate = formData.get("moveDate") as string
        const timeSlot = formData.get("timeSlot") as string
        const movingCompany = formData.get("movingCompany") as string
        const reason = formData.get("reason") as string
        const largeItems = formData.get("largeItems") as string
        const unitId = formData.get("unitId") as string

        if (!type || !moveDate || !timeSlot || !reason || !unitId) {
            throw new Error("Move type, date, time slot, reason, and unit are required")
        }

        const { data, error } = await supabase
            .from("move_requests")
            .insert({
                user_id: user.id,
                type,
                move_date: moveDate,
                time_slot: timeSlot,
                moving_company: movingCompany || null,
                reason,
                large_items: largeItems || null,
                unit_id: unitId,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create move request: ${error.message}`)
        }

        revalidatePath("/resident/move-requests")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating move request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create move request")
    }
}

// Get resident's own move requests
export async function getMyMoveRequests() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("move_requests")
            .select("*")
            .eq("user_id", user.id)
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

// Get resident's move request statistics
export async function getMyMoveRequestStats() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("move_requests")
            .select("status, created_at")
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to fetch move request stats: ${error.message}`)
        }

        const stats = {
            totalRequests: data?.length || 0,
            pendingRequests: data?.filter((r) => r.status === "pending").length || 0,
            approvedRequests: data?.filter((r) => r.status === "approved").length || 0,
            completedRequests: data?.filter((r) => r.status === "completed").length || 0,
        }

        return stats
    } catch (error) {
        console.error("Error fetching move request stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch move request statistics")
    }
}

// Get a specific move request by ID (resident can only see their own)
export async function getMyMoveRequestById(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("move_requests")
            .select("*")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (error || !data) {
            throw new Error("Move request not found or access denied")
        }

        return data
    } catch (error) {
        console.error("Error fetching move request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch move request")
    }
}

// Update a move request (resident can only update pending requests)
export async function updateMyMoveRequest(requestId: string, formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user
        const { data: request, error: fetchError } = await supabase
            .from("move_requests")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Move request not found or access denied")
        }

        // Residents can only update pending requests
        if (request.status !== "pending") {
            throw new Error("Cannot update move request that is no longer pending")
        }

        const moveDate = formData.get("moveDate") as string
        const timeSlot = formData.get("timeSlot") as string
        const movingCompany = formData.get("movingCompany") as string
        const reason = formData.get("reason") as string
        const largeItems = formData.get("largeItems") as string
        const unitId = formData.get("unitId") as string

        const updateData: any = {}

        if (moveDate) updateData.move_date = moveDate
        if (timeSlot) updateData.time_slot = timeSlot
        if (movingCompany !== null) updateData.moving_company = movingCompany
        if (reason) updateData.reason = reason
        if (largeItems !== null) updateData.large_items = largeItems
        if (unitId) updateData.unit_id = unitId

        const { error } = await supabase
            .from("move_requests")
            .update(updateData)
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to update move request: ${error.message}`)
        }

        revalidatePath("/resident/move-requests")
        return { success: true }
    } catch (error) {
        console.error("Error updating move request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update move request")
    }
}

// Cancel a move request (resident can only cancel pending requests)
export async function cancelMoveRequest(requestId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the request belongs to the current user
        const { data: request, error: fetchError } = await supabase
            .from("move_requests")
            .select("id, user_id, status")
            .eq("id", requestId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !request) {
            throw new Error("Move request not found or access denied")
        }

        // Residents can only cancel pending requests
        if (request.status !== "pending") {
            throw new Error("Cannot cancel move request that is no longer pending")
        }

        const { error } = await supabase
            .from("move_requests")
            .update({
                status: "cancelled",
            })
            .eq("id", requestId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to cancel move request: ${error.message}`)
        }

        revalidatePath("/resident/move-requests")
        return { success: true }
    } catch (error) {
        console.error("Error canceling move request:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to cancel move request")
    }
}

// Get resident's available units for move requests
export async function getMyAvailableUnits() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Get units the resident lives in (for move-out requests)
        const { data: residingUnits, error: residencyError } = await supabase
            .from("unit_residency")
            .select(`
                units (
                    id,
                    block,
                    unit_number,
                    status
                )
            `)
            .eq("resident_id", user.id)
            .eq("is_active", true)

        if (residencyError) {
            console.error("Error fetching residing units:", residencyError)
        }

        // Get units the resident owns (for move-in requests)
        const { data: ownedUnits, error: ownershipError } = await supabase
            .from("unit_ownership")
            .select(`
                units (
                    id,
                    block,
                    unit_number,
                    status
                )
            `)
            .eq("owner_id", user.id)
            .eq("is_active", true)

        if (ownershipError) {
            console.error("Error fetching owned units:", ownershipError)
        }

        // Combine and deduplicate units
        const allUnits = [
            ...(residingUnits?.map((r: any) => r.units) || []),
            ...(ownedUnits?.map((o: any) => o.units) || [])
        ]

        // Remove duplicates based on unit ID
        const uniqueUnits = allUnits.filter((unit, index, self) =>
            index === self.findIndex((u) => u.id === unit.id)
        )

        return uniqueUnits || []
    } catch (error) {
        console.error("Error fetching available units:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch available units")
    }
} 