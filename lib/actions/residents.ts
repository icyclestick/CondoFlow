"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

// Get all residents (Admin only)
export async function getAllResidents() {
  const supabase = createServerSupabaseServiceClient()

  try {
    console.log("Fetching residents from profiles...")
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
      console.error("Error fetching residents:", error)
      throw new Error(`Failed to fetch residents: ${error.message}`)
    }

    const residentsWithUnits = await Promise.all(
      (residents || []).map(async (resident) => {
        // Get primary residence
        const { data: residingUnits, error: residencyError } = await supabase
          .from("unit_residency")
          .select(`
            id,
            residency_type,
            is_primary_resident,
            monthly_rent,
            lease_end_date,
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

        if (residencyError) {
          console.error("Error fetching unit_residency:", residencyError)
        }

        // Get ownership information
        const { data: ownedUnits, error: ownershipError } = await supabase
          .from("unit_ownership")
          .select(`
            id,
            ownership_percentage,
            ownership_type,
            start_date,
            units:unit_id (
              id,
              block,
              unit_number,
              status
            )
          `)
          .eq("owner_id", resident.id)
          .eq("is_active", true)

        if (ownershipError) {
          console.error("Error fetching unit_ownership:", ownershipError)
        }

        // Get primary residence unit
        const primaryResidence = residingUnits?.find((r) => r.is_primary_resident) || residingUnits?.[0] || null

        // FIXED: Return data structure that matches UI expectations
        return {
          ...resident,
          units: primaryResidence?.units || null,
          residency_type: primaryResidence?.residency_type || null,
          total_residing_units: residingUnits?.length || 0,
          total_owned_units: ownedUnits?.length || 0,
          // Keep the detailed data for other uses
          residency: primaryResidence
            ? {
                type: primaryResidence.residency_type,
                is_primary: primaryResidence.is_primary_resident,
                monthly_rent: primaryResidence.monthly_rent,
                lease_end_date: primaryResidence.lease_end_date,
              }
            : null,
          ownership: ownedUnits || [],
          is_owner: (ownedUnits?.length || 0) > 0,
        }
      }),
    )

    return residentsWithUnits
  } catch (error) {
    console.error("Error fetching residents:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents")
  }
}

// Get residents by block (Admin only) - FIXED to match UI expectations
export async function getResidentsByBlock(block: string) {
  const supabase = createServerSupabaseServiceClient()

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
        residency_type,
        is_primary_resident,
        monthly_rent,
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

    // Get ownership data for these residents in this block
    const { data: ownerships, error: ownershipError } = await supabase
      .from("unit_ownership")
      .select(`
        owner_id,
        ownership_percentage,
        ownership_type,
        units:unit_id (
          id,
          block,
          unit_number
        )
      `)
      .in("unit_id", unitIds)
      .in("owner_id", residentIds)
      .eq("is_active", true)

    if (ownershipError) {
      console.error("Error fetching ownership data:", ownershipError)
    }

    // Combine resident data with their unit information - FIXED to match UI
    const residentsWithUnits =
      residents?.map((resident) => {
        const residency = residencies.find((r) => r.resident_id === resident.id)
        const ownership = ownerships?.filter((o) => o.owner_id === resident.id) || []

        return {
          ...resident,
          units: residency ? residency.units : null,
          residency_type: residency?.residency_type || null,
          total_residing_units: residencies.filter((r) => r.resident_id === resident.id).length,
          total_owned_units: ownership.length,
          // Keep detailed data
          residency: residency
            ? {
                type: residency.residency_type,
                is_primary: residency.is_primary_resident,
                monthly_rent: residency.monthly_rent,
              }
            : null,
          ownership: ownership,
          is_owner: ownership.length > 0,
        }
      }) || []

    return residentsWithUnits
  } catch (error) {
    console.error("Error fetching residents by block:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents by block")
  }
}

// Keep all other functions the same...
export async function getResidentById(id: string) {
  const supabase = createServerSupabaseServiceClient()

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

    // Get all residency records (current and historical)
    const { data: residencies, error: residencyError } = await supabase
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
        units:unit_id (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
      .eq("resident_id", id)
      .order("is_active", { ascending: false })
      .order("start_date", { ascending: false })

    if (residencyError) {
      console.error("Error fetching residencies:", residencyError)
    }

    // Get all ownership records (current and historical)
    const { data: ownerships, error: ownershipError } = await supabase
      .from("unit_ownership")
      .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
        units:unit_id (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
      .eq("owner_id", id)
      .order("is_active", { ascending: false })
      .order("start_date", { ascending: false })

    if (ownershipError) {
      console.error("Error fetching ownerships:", ownershipError)
    }

    // Get primary residence
    const primaryResidence = residencies?.find((r) => r.is_active && r.is_primary_resident) || null

    return {
      ...resident,
      units: primaryResidence?.units || null,
      residency: primaryResidence
        ? {
            id: primaryResidence.id,
            residency_type: primaryResidence.residency_type,
            is_primary_resident: primaryResidence.is_primary_resident,
            start_date: primaryResidence.start_date,
            end_date: primaryResidence.end_date,
            monthly_rent: primaryResidence.monthly_rent,
            lease_end_date: primaryResidence.lease_end_date,
        }
        : null,
      all_residencies: residencies || [],
      all_ownerships: ownerships || [],
      active_ownerships: ownerships?.filter((o) => o.is_active) || [],
      total_owned_units: ownerships?.filter((o) => o.is_active).length || 0,
      is_owner: (ownerships?.filter((o) => o.is_active).length || 0) > 0,
    }
  } catch (error) {
    console.error("Error fetching resident by ID:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch resident")
  }
}

// Keep all other functions unchanged...
export async function updateResident(id: string, formData: FormData) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const emergencyContactName = formData.get("emergencyContactName") as string
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string
    const unitId = formData.get("unitId") as string
    const residencyType = (formData.get("residencyType") as string) || "tenant"
    const monthlyRent = formData.get("monthlyRent") as string
    const leaseEndDate = formData.get("leaseEndDate") as string

    if (!fullName || !email) {
      throw new Error("Full name and email are required")
    }

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

    if (unitId) {
      const { data: existingResidency } = await supabase
        .from("unit_residency")
        .select("id")
        .eq("resident_id", id)
        .eq("is_active", true)
        .single()

      if (existingResidency) {
        await supabase
          .from("unit_residency")
          .update({
            unit_id: unitId,
            residency_type: residencyType,
            monthly_rent: monthlyRent ? Number.parseFloat(monthlyRent) : null,
            lease_end_date: leaseEndDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingResidency.id)
      } else {
        await supabase.from("unit_residency").insert({
          resident_id: id,
          unit_id: unitId,
          residency_type: residencyType,
          start_date: new Date().toISOString(),
          is_primary_resident: true,
          is_active: true,
          monthly_rent: monthlyRent ? Number.parseFloat(monthlyRent) : null,
          lease_end_date: leaseEndDate || null,
        })
      }

      if (residencyType === "owner-occupied") {
        const { data: existingOwnership } = await supabase
          .from("unit_ownership")
          .select("id")
          .eq("owner_id", id)
          .eq("unit_id", unitId)
          .eq("is_active", true)
          .single()

        if (!existingOwnership) {
          await supabase.from("unit_ownership").insert({
            owner_id: id,
            unit_id: unitId,
            ownership_percentage: 100.0,
            ownership_type: "primary",
            start_date: new Date().toISOString(),
            is_active: true,
          })
        }
      }
    }

    revalidatePath("/admin/residents")
    return { success: true, data: updatedResident }
  } catch (error) {
    console.error("Error updating resident:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update resident")
  }
}

export async function createUnitOwnership(formData: FormData) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const ownerId = formData.get("ownerId") as string
    const unitId = formData.get("unitId") as string
    const ownershipPercentage = Number.parseFloat(formData.get("ownershipPercentage") as string)
    const ownershipType = (formData.get("ownershipType") as string) || "primary"
    const startDate = formData.get("startDate") as string

    if (!ownerId || !unitId || !ownershipPercentage) {
      throw new Error("Owner, unit, and ownership percentage are required")
    }

    const { data: existingOwnerships } = await supabase
      .from("unit_ownership")
      .select("ownership_percentage")
      .eq("unit_id", unitId)
      .eq("is_active", true)

    const totalExistingPercentage = existingOwnerships?.reduce((sum, o) => sum + o.ownership_percentage, 0) || 0

    if (totalExistingPercentage + ownershipPercentage > 100) {
      throw new Error(`Total ownership would exceed 100%. Current total: ${totalExistingPercentage}%`)
    }

    const { data: ownership, error } = await supabase
      .from("unit_ownership")
      .insert({
        owner_id: ownerId,
        unit_id: unitId,
        ownership_percentage: ownershipPercentage,
        ownership_type: ownershipType,
        start_date: startDate || new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ownership: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/ownership")
    return { success: true, data: ownership }
  } catch (error) {
    console.error("Error creating ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create ownership")
  }
}

export async function transferUnitOwnership(formData: FormData) {
  const supabase = createServerSupabaseServiceClient()

  try {
    const ownershipId = formData.get("ownershipId") as string
    const newOwnerId = formData.get("newOwnerId") as string
    const endDate = formData.get("endDate") as string

    if (!ownershipId || !newOwnerId) {
      throw new Error("Ownership ID and new owner are required")
    }

    const { data: currentOwnership, error: fetchError } = await supabase
      .from("unit_ownership")
      .select("*")
      .eq("id", ownershipId)
      .eq("is_active", true)
      .single()

    if (fetchError || !currentOwnership) {
      throw new Error("Ownership record not found")
    }

    const { error: endError } = await supabase
      .from("unit_ownership")
      .update({
        is_active: false,
        end_date: endDate || new Date().toISOString(),
      })
      .eq("id", ownershipId)

    if (endError) {
      throw new Error(`Failed to end current ownership: ${endError.message}`)
    }

    const { data: newOwnership, error: createError } = await supabase
      .from("unit_ownership")
      .insert({
        owner_id: newOwnerId,
        unit_id: currentOwnership.unit_id,
        ownership_percentage: currentOwnership.ownership_percentage,
        ownership_type: currentOwnership.ownership_type,
        start_date: endDate || new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create new ownership: ${createError.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/ownership")
    return { success: true, data: newOwnership }
  } catch (error) {
    console.error("Error transferring ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to transfer ownership")
  }
}

export async function deleteResident(id: string) {
  const supabase = createServerSupabaseServiceClient()

  try {
    await supabase
      .from("unit_residency")
      .update({
        is_active: false,
        end_date: new Date().toISOString(),
      })
      .eq("resident_id", id)
      .eq("is_active", true)

    await supabase
      .from("unit_ownership")
      .update({
        is_active: false,
        end_date: new Date().toISOString(),
      })
      .eq("owner_id", id)
      .eq("is_active", true)

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

export async function getResidentStats() {
  const supabase = createServerSupabaseServiceClient()

  try {
    const { count: totalResidents, error: totalError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "resident")

    if (totalError) {
      throw new Error(`Failed to get total residents: ${totalError.message}`)
    }

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

    const { count: totalOwners, error: ownersError } = await supabase
      .from("unit_ownership")
      .select("owner_id", { count: "exact", head: true })
      .eq("is_active", true)

    if (ownersError) {
      console.error("Error fetching owner count:", ownersError)
    }

    const { data: tenantData, error: tenantError } = await supabase
      .from("unit_residency")
      .select("resident_id")
      .eq("is_active", true)
      .eq("residency_type", "tenant")

    if (tenantError) {
      console.error("Error fetching tenant data:", tenantError)
    }

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
      totalOwners: totalOwners || 0,
      totalTenants: tenantData?.length || 0,
      blockCounts,
    }
  } catch (error) {
    console.error("Error fetching resident stats:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch resident statistics")
    }
}
