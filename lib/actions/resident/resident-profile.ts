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

// Get resident's own profile
export async function getMyProfile() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        id,
        full_name,
        email,
        phone,
        role,
        profile_type,
        created_at,
        updated_at,
        move_in_date,
        avatar_url,
        is_verified,
        emergency_contact_name,
        emergency_contact_phone
      `)
            .eq("id", user.id)
            .single()

        if (error) {
            throw new Error(`Failed to fetch profile: ${error.message}`)
        }

        return data
    } catch (error) {
        console.error("Error fetching profile:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch profile")
    }
}

// Update resident's profile
export async function updateMyProfile(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const fullName = formData.get("fullName") as string
        const phone = formData.get("phone") as string
        const emergencyContactName = formData.get("emergencyContactName") as string
        const emergencyContactPhone = formData.get("emergencyContactPhone") as string
        const avatarUrl = formData.get("avatarUrl") as string

        if (!fullName) {
            throw new Error("Full name is required")
        }

        const updateData: any = {
            full_name: fullName,
            phone: phone || null,
            emergency_contact_name: emergencyContactName || null,
            emergency_contact_phone: emergencyContactPhone || null,
            updated_at: new Date().toISOString(),
        }

        if (avatarUrl) {
            updateData.avatar_url = avatarUrl
        }

        const { data, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update profile: ${error.message}`)
        }

        revalidatePath("/resident/profile")
        return { success: true, data }
    } catch (error) {
        console.error("Error updating profile:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to update profile")
    }
}

// Get resident's unit information
export async function getMyUnitInfo() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Get current residency
        const { data: residency, error: residencyError } = await supabase
            .from("unit_residency")
            .select(`
        id,
        residency_type,
        is_primary_resident,
        start_date,
        end_date,
        monthly_rent,
        lease_end_date,
        is_active,
        units (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
            .eq("resident_id", user.id)
            .eq("is_active", true)
            .order("is_primary_resident", { ascending: false })
            .limit(1)
            .single()

        if (residencyError && residencyError.code !== "PGRST116") {
            console.error("Error fetching residency:", residencyError)
        }

        // Get ownership information
        const { data: ownership, error: ownershipError } = await supabase
            .from("unit_ownership")
            .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
        units (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
            .eq("owner_id", user.id)
            .eq("is_active", true)

        if (ownershipError) {
            console.error("Error fetching ownership:", ownershipError)
        }

        return {
            residency: residency || null,
            ownership: ownership || [],
            isOwner: (ownership?.length || 0) > 0,
            primaryUnit: residency?.units || null,
        }
    } catch (error) {
        console.error("Error fetching unit info:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch unit information")
    }
}

// Change resident's password
export async function changePassword(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error("All password fields are required")
        }

        if (newPassword !== confirmPassword) {
            throw new Error("New passwords do not match")
        }

        if (newPassword.length < 6) {
            throw new Error("New password must be at least 6 characters long")
        }

        // Update password in Supabase Auth
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (error) {
            throw new Error(`Failed to change password: ${error.message}`)
        }

        revalidatePath("/resident/profile")
        return { success: true }
    } catch (error) {
        console.error("Error changing password:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to change password")
    }
}

// Upload profile avatar
export async function uploadAvatar(formData: FormData) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const file = formData.get("avatar") as File

        if (!file) {
            throw new Error("No file provided")
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            throw new Error("File must be an image")
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB")
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file)

        if (uploadError) {
            throw new Error(`Failed to upload file: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                avatar_url: urlData.publicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`)
        }

        revalidatePath("/resident/profile")
        return { success: true, avatarUrl: urlData.publicUrl }
    } catch (error) {
        console.error("Error uploading avatar:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to upload avatar")
    }
}

// Delete profile avatar
export async function deleteAvatar() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Get current avatar URL
        const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .single()

        if (fetchError) {
            throw new Error(`Failed to fetch profile: ${fetchError.message}`)
        }

        if (profile.avatar_url) {
            // Extract filename from URL
            const urlParts = profile.avatar_url.split("/")
            const fileName = urlParts[urlParts.length - 1]

            // Delete from storage
            const { error: deleteError } = await supabase.storage.from("avatars").remove([fileName])

            if (deleteError) {
                console.error("Error deleting file from storage:", deleteError)
            }
        }

        // Update profile to remove avatar URL
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                avatar_url: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`)
        }

        revalidatePath("/resident/profile")
        return { success: true }
    } catch (error) {
        console.error("Error deleting avatar:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete avatar")
    }
} 