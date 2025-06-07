"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Authentication & Authorization Helper
async function getAuthenticatedUser(requiredRole?: "admin" | "resident") {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  if (requiredRole) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== requiredRole) {
      throw new Error(`Access denied. ${requiredRole} role required.`)
    }
  }

  return { user, supabase }
}

// Get all residents (Admin only)
export async function getAllResidents() {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const { data: residents, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        profile_type,
        created_at,
        move_in_date,
        avatar_url,
        is_verified,
        emergency_contact_name,
        emergency_contact_phone
      `)
      .eq("role", "resident")
      .order("full_name")

    if (error) {
      throw new Error(`Failed to fetch residents: ${error.message}`)
    }

    // Get unit relationships for each resident
    const residentsWithUnits = await Promise.all(
      (residents || []).map(async (resident) => {
        // Get primary unit they live in
        const { data: residingUnits } = await supabase
          .from("unit_residency")
          .select(`
            id,
            residency_type,
            is_primary_resident,
            units:unit_id (
              id,
              block,
              unit_number,
              status
            )
          `)
          .eq("resident_id", resident.id)
          .eq("is_active", true)
          .order("is_primary_resident", { ascending: false })
          .limit(1)

        // Transform to match the expected Resident interface
        return {
          ...resident,
          units: residingUnits && residingUnits.length > 0 ? residingUnits[0].units : null,
        }
      }),
    )

    return residentsWithUnits
  } catch (error) {
    console.error("Error fetching residents:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents")
  }
}

// Get residents by block (Admin only)
export async function getResidentsByBlock(block: string) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // First get all units in the specified block
    const { data: unitsInBlock, error: unitsError } = await supabase.from("units").select("id").eq("block", block)

    if (unitsError) {
      throw new Error(`Failed to fetch units in block: ${unitsError.message}`)
    }

    if (!unitsInBlock || unitsInBlock.length === 0) {
      return []
    }

    const unitIds = unitsInBlock.map((unit) => unit.id)

    // Get all residents living in these units
    const { data: residencies, error: residenciesError } = await supabase
      .from("unit_residency")
      .select(`
        resident_id,
        units:unit_id (
          id,
          block,
          unit_number,
          status
        )
      `)
      .in("unit_id", unitIds)
      .eq("is_active", true)

    if (residenciesError) {
      throw new Error(`Failed to fetch residencies: ${residenciesError.message}`)
    }

    if (!residencies || residencies.length === 0) {
      return []
    }

    // Get resident profiles
    const residentIds = residencies.map((r) => r.resident_id)
    const { data: residents, error: residentsError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        created_at,
        move_in_date,
        avatar_url
      `)
      .in("id", residentIds)
      .eq("role", "resident")
      .order("full_name")

    if (residentsError) {
      throw new Error(`Failed to fetch residents: ${residentsError.message}`)
    }

    // Combine resident data with their unit information
    const residentsWithUnits =
      residents?.map((resident) => {
        const residency = residencies.find((r) => r.resident_id === resident.id)
        return {
          ...resident,
          units: residency ? residency.units : null,
        }
      }) || []

    return residentsWithUnits
  } catch (error) {
    console.error("Error fetching residents by block:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents by block")
  }
}

// Get resident by ID (Admin only)
export async function getResidentById(id: string) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Get resident profile
    const { data: resident, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        created_at,
        updated_at,
        move_in_date,
        avatar_url,
        emergency_contact_name,
        emergency_contact_phone
      `)
      .eq("id", id)
      .eq("role", "resident")
      .single()

    if (error) {
      throw new Error(`Failed to fetch resident: ${error.message}`)
    }

    // Get resident's primary unit
    const { data: residency } = await supabase
      .from("unit_residency")
      .select(`
        id,
        residency_type,
        is_primary_resident,
        start_date,
        end_date,
        monthly_rent,
        lease_end_date,
        units:unit_id (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
      .eq("resident_id", id)
      .eq("is_active", true)
      .order("is_primary_resident", { ascending: false })
      .limit(1)
      .single()

    // Return combined data
    return {
      ...resident,
      units: residency?.units || null,
      residency: residency
        ? {
          id: residency.id,
          residency_type: residency.residency_type,
          is_primary_resident: residency.is_primary_resident,
          start_date: residency.start_date,
          end_date: residency.end_date,
          monthly_rent: residency.monthly_rent,
          lease_end_date: residency.lease_end_date,
        }
        : null,
    }
  } catch (error) {
    console.error("Error fetching resident by ID:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch resident")
  }
}

// Update resident (Admin only)
export async function updateResident(id: string, formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Validate form data
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const emergencyContactName = formData.get("emergencyContactName") as string
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string
    const unitId = formData.get("unitId") as string
    const residencyType = (formData.get("residencyType") as string) || "tenant"

    if (!fullName || !email) {
      throw new Error("Full name and email are required")
    }

    // Update profile information
    const { data: updatedResident, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email: email,
        phone: phone || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("role", "resident")
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update resident: ${error.message}`)
    }

    // If unit ID is provided, update or create unit residency
    if (unitId) {
      // Check if there's an existing active residency
      const { data: existingResidency } = await supabase
        .from("unit_residency")
        .select("id")
        .eq("resident_id", id)
        .eq("is_active", true)
        .single()

      if (existingResidency) {
        // Update existing residency
        await supabase
          .from("unit_residency")
          .update({
            unit_id: unitId,
            residency_type: residencyType,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingResidency.id)
      } else {
        // Create new residency
        await supabase.from("unit_residency").insert({
          resident_id: id,
          unit_id: unitId,
          residency_type: residencyType,
          start_date: new Date().toISOString(),
          is_primary_resident: true,
          is_active: true,
        })
      }
    }

    revalidatePath("/admin/residents")
    return { success: true, data: updatedResident }
  } catch (error) {
    console.error("Error updating resident:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update resident")
  }
}

// Delete resident (Admin only)
export async function deleteResident(id: string) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // First deactivate any active residencies
    await supabase
      .from("unit_residency")
      .update({
        is_active: false,
        end_date: new Date().toISOString(),
      })
      .eq("resident_id", id)
      .eq("is_active", true)

    // Then delete the profile
    const { error } = await supabase.from("profiles").delete().eq("id", id).eq("role", "resident")

    if (error) {
      throw new Error(`Failed to delete resident: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resident:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete resident")
  }
}

// Get resident statistics (Admin only)
export async function getResidentStats() {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Get total residents
    const { count: totalResidents, error: totalError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "resident")

    if (totalError) {
      throw new Error(`Failed to get total residents: ${totalError.message}`)
    }

    // Get residents by status (active/inactive based on recent activity)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeResidents, error: activeError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "resident")
      .gte("updated_at", thirtyDaysAgo.toISOString())

    if (activeError) {
      throw new Error(`Failed to get active residents: ${activeError.message}`)
    }

    // Get block statistics
    const { data: blockData, error: blockError } = await supabase
      .from("unit_residency")
      .select(`
        units:unit_id (
          block
        )
      `)
      .eq("is_active", true)
      .not("units", "is", null)

    if (blockError) {
      throw new Error(`Failed to get block stats: ${blockError.message}`)
    }

    // Count residents by block
    const blockCounts =
      blockData?.reduce((acc: Record<string, number>, residency: any) => {
        const block = residency.units?.block
        if (block) {
          acc[block] = (acc[block] || 0) + 1
        }
        return acc
      }, {}) || {}

    return {
      totalResidents: totalResidents || 0,
      activeResidents: activeResidents || 0,
      inactiveResidents: (totalResidents || 0) - (activeResidents || 0),
      blockCounts,
    }
  } catch (error) {
    console.error("Error fetching resident stats:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch resident statistics")
  }
}
