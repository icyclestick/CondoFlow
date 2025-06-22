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

// Create a new complaint
export async function createComplaint(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const complaintType = formData.get("complaintType") as string
        const location = formData.get("location") as string
        const description = formData.get("description") as string
        const urgency = formData.get("urgency") as string
        const imageUrl = formData.get("imageUrl") as string

        if (!complaintType || !location || !description) {
            throw new Error("Complaint type, location, and description are required")
        }

        const { data, error } = await supabase
            .from("complaints")
            .insert({
                user_id: user.id,
                complaint_type: complaintType,
                location,
                description,
                urgency: urgency || "medium",
                image_url: imageUrl || null,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create complaint: ${error.message}`)
        }

        revalidatePath("/resident/complaints")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating complaint:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create complaint")
    }
}

// Get resident's own complaints
export async function getMyComplaints() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("complaints")
            .select("*")
            .eq("user_id", user.id)
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

// Get resident's complaint statistics
export async function getMyComplaintStats() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("complaints")
            .select("status, created_at")
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to fetch complaint stats: ${error.message}`)
        }

        const stats = {
            totalComplaints: data?.length || 0,
            openComplaints: data?.filter((c) => c.status === "pending").length || 0,
            inProgressComplaints: data?.filter((c) => c.status === "in-progress").length || 0,
            resolvedComplaints: data?.filter((c) => c.status === "resolved").length || 0,
            cancelledComplaints: data?.filter((c) => c.status === "cancelled").length || 0,
        }

        return stats
    } catch (error) {
        console.error("Error fetching complaint stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch complaint statistics")
    }
}

// Get a specific complaint by ID (resident can only see their own)
export async function getMyComplaintById(complaintId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("complaints")
            .select("*")
            .eq("id", complaintId)
            .eq("user_id", user.id)
            .single()

        if (error || !data) {
            throw new Error("Complaint not found or access denied")
        }

        return data
    } catch (error) {
        console.error("Error fetching complaint:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch complaint")
    }
}

// Update a complaint (resident can only update certain fields)
export async function updateMyComplaint(complaintId: string, formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the complaint belongs to the current user
        const { data: complaint, error: fetchError } = await supabase
            .from("complaints")
            .select("id, user_id, status")
            .eq("id", complaintId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !complaint) {
            throw new Error("Complaint not found or access denied")
        }

        // Residents can only update complaints that are still pending
        if (complaint.status !== "pending") {
            throw new Error("Cannot update complaint that is no longer pending")
        }

        const complaintType = formData.get("complaintType") as string
        const location = formData.get("location") as string
        const description = formData.get("description") as string
        const urgency = formData.get("urgency") as string
        const imageUrl = formData.get("imageUrl") as string

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (complaintType) updateData.complaint_type = complaintType
        if (location) updateData.location = location
        if (description) updateData.description = description
        if (urgency) updateData.urgency = urgency
        if (imageUrl) updateData.image_url = imageUrl

        const { error } = await supabase
            .from("complaints")
            .update(updateData)
            .eq("id", complaintId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to update complaint: ${error.message}`)
        }

        revalidatePath("/resident/complaints")
        return { success: true }
    } catch (error) {
        console.error("Error updating complaint:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update complaint")
    }
}

// Cancel a complaint (resident can only cancel pending complaints)
export async function cancelComplaint(complaintId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the complaint belongs to the current user and is pending
        const { data: complaint, error: fetchError } = await supabase
            .from("complaints")
            .select("id, user_id, status")
            .eq("id", complaintId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !complaint) {
            throw new Error("Complaint not found or access denied")
        }

        if (complaint.status !== "pending") {
            throw new Error("Cannot cancel complaint that is no longer pending")
        }

        const { error } = await supabase
            .from("complaints")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", complaintId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to cancel complaint: ${error.message}`)
        }

        revalidatePath("/resident/complaints")
        return { success: true }
    } catch (error) {
        console.error("Error canceling complaint:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to cancel complaint")
    }
} 