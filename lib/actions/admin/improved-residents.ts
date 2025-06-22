"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
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

  return { user, supabase: createServerSupabaseServiceClient() } // ✅ Use service client for admin operations
}

// Get all residents with their unit relationships (Admin only)
export async function getAllResidentsWithUnits() {
  const { supabase } = await getAuthenticatedUser("admin")

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
      .in("role", ["resident"])
      .order("full_name")

    if (error) {
      throw new Error(`Failed to fetch residents: ${error.message}`)
    }

    console.log(`Found ${residents?.length || 0} residents`)

    // Get unit relationships for each resident
    const residentsWithUnits = await Promise.all(
      (residents || []).map(async (resident) => {
        console.log(`Fetching ownership for resident: ${resident.full_name}`)

        // Get units they own
        const { data: ownedUnits, error: ownershipError } = await supabase
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
          .eq("owner_id", resident.id)
          .eq("is_active", true)

        if (ownershipError) {
          console.error("Error fetching unit_ownership:", ownershipError)
        }

        console.log(`Fetching residency for resident: ${resident.full_name}`)

        // Get units they live in
        const { data: residingUnits, error: residencyError } = await supabase
          .from("unit_residency")
          .select(`
            id,
            residency_type,
            start_date,
            end_date,
            is_primary_resident,
            is_active,
            monthly_rent,
            lease_end_date,
            units (
              id,
              block,
              unit_number,
              status,
              monthly_fee
            )
          `)
          .eq("resident_id", resident.id)
          .eq("is_active", true)

        if (residencyError) {
          console.error("Error fetching unit_residency:", residencyError)
        }

        return {
          ...resident,
          owned_units: ownedUnits || [],
          residing_units: residingUnits || [],
        }
      }),
    )

    return residentsWithUnits
  } catch (error) {
    console.error("Error fetching residents with units:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents")
  }
}

// Alias for backward compatibility
export const getAllResidents = getAllResidentsWithUnits

// Get all unit owners (Admin only)
export async function getAllUnitOwners() {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Fetch all active ownerships with owner and unit info
    const { data: owners, error } = await supabase
      .from("unit_ownership")
      .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
        owner_id,
        unit_id,
        profiles!unit_ownership_owner_id_fkey (
          id,
          full_name,
          email,
          phone,
          profile_type,
          avatar_url,
          is_verified
        ),
        units!unit_ownership_unit_id_fkey (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
      .eq("is_active", true)
      .order("start_date", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch unit owners: ${error.message}`)
    }

    // Fetch all active residencies
    const { data: residencies, error: residencyError } = await supabase
      .from("unit_residency")
      .select("unit_id, resident_id, is_active")
      .eq("is_active", true)

    if (residencyError) {
      throw new Error(`Failed to fetch residencies: ${residencyError.message}`)
    }

    // Build a Set for quick lookup of owner-occupied
    const ownerOccupiedSet = new Set(
      (residencies || []).map(r => `${r.unit_id}:${r.resident_id}`)
    );

    // Add is_owner_occupied property to each ownership record
    const ownersWithOccupancy = (owners || []).map((ownership) => ({
      ...ownership,
      is_owner_occupied: ownerOccupiedSet.has(`${ownership.unit_id}:${ownership.owner_id}`),
    }));

    return ownersWithOccupancy;
  } catch (error) {
    console.error("Error fetching unit owners:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch unit owners")
  }
}

// Get unit details with all owners and residents (Admin only)
export async function getUnitWithDetails(unitId: string) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Get unit basic info
    const { data: unit, error: unitError } = await supabase.from("units").select("*").eq("id", unitId).single()

    if (unitError) {
      throw new Error(`Failed to fetch unit: ${unitError.message}`)
    }

    // Get all owners
    const { data: owners, error: ownersError } = await supabase
      .from("unit_ownership")
      .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
        profiles (
          id,
          full_name,
          email,
          phone,
          profile_type,
          avatar_url
        )
      `)
      .eq("unit_id", unitId)
      .eq("is_active", true)

    if (ownersError) {
      throw new Error(`Failed to fetch owners: ${ownersError.message}`)
    }

    // Get all residents
    const { data: residents, error: residentsError } = await supabase
      .from("unit_residency")
      .select(`
        id,
        residency_type,
        start_date,
        end_date,
        is_primary_resident,
        is_active,
        monthly_rent,
        lease_end_date,
        profiles (
          id,
          full_name,
          email,
          phone,
          profile_type,
          avatar_url
        )
      `)
      .eq("unit_id", unitId)
      .eq("is_active", true)

    if (residentsError) {
      throw new Error(`Failed to fetch residents: ${residentsError.message}`)
    }

    return {
      ...unit,
      owners: owners || [],
      residents: residents || [],
      primary_owner: owners?.find((o) => o.ownership_type === "primary")?.profiles,
      primary_resident: residents?.find((r) => r.is_primary_resident)?.profiles,
    }
  } catch (error) {
    console.error("Error fetching unit details:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch unit details")
  }
}

// Add unit ownership (Admin only)
export async function addUnitOwnership(formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const unitId = formData.get("unitId") as string
    const ownerId = formData.get("ownerId") as string
    const ownershipPercentage = Number(formData.get("ownershipPercentage")) || 100
    const ownershipType = (formData.get("ownershipType") as string) || "primary"
    const startDate = formData.get("startDate") as string

    if (!unitId || !ownerId) {
      throw new Error("Unit ID and Owner ID are required")
    }

    // Check if total ownership would exceed 100%
    const { data: existingOwnerships } = await supabase
      .from("unit_ownership")
      .select("ownership_percentage")
      .eq("unit_id", unitId)
      .eq("is_active", true)

    const totalExistingPercentage = existingOwnerships?.reduce((sum, o) => sum + o.ownership_percentage, 0) || 0

    if (totalExistingPercentage + ownershipPercentage > 100) {
      throw new Error(`Total ownership would exceed 100%. Current total: ${totalExistingPercentage}%`)
    }

    const { data, error } = await supabase
      .from("unit_ownership")
      .insert({
        unit_id: unitId,
        owner_id: ownerId,
        ownership_percentage: ownershipPercentage,
        ownership_type: ownershipType,
        start_date: startDate,
        is_active: true,
      })
      .select()

    if (error) {
      throw new Error(`Failed to add ownership: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/units")
    revalidatePath("/admin/ownership")
    return { success: true, data }
  } catch (error) {
    console.error("Error adding unit ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add unit ownership")
  }
}

// ✅ NEW: Edit unit ownership (Admin only)
export async function editUnitOwnership(ownershipId: string, formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const ownershipPercentage = Number(formData.get("ownershipPercentage")) || 100
    const ownershipType = (formData.get("ownershipType") as string) || "primary"
    const startDate = formData.get("startDate") as string
    const endDate = (formData.get("endDate") as string) || null
    const isActive = formData.get("isActive") === "true"

    // Get current ownership to check unit_id for validation
    const { data: currentOwnership, error: fetchError } = await supabase
      .from("unit_ownership")
      .select("unit_id, ownership_percentage")
      .eq("id", ownershipId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch current ownership: ${fetchError.message}`)
    }

    // Check if total ownership would exceed 100% (excluding current record)
    const { data: otherOwnerships } = await supabase
      .from("unit_ownership")
      .select("ownership_percentage")
      .eq("unit_id", currentOwnership.unit_id)
      .eq("is_active", true)
      .neq("id", ownershipId)

    const totalOtherPercentage = otherOwnerships?.reduce((sum, o) => sum + o.ownership_percentage, 0) || 0

    if (isActive && totalOtherPercentage + ownershipPercentage > 100) {
      throw new Error(`Total ownership would exceed 100%. Other owners total: ${totalOtherPercentage}%`)
    }

    const { data, error } = await supabase
      .from("unit_ownership")
      .update({
        ownership_percentage: ownershipPercentage,
        ownership_type: ownershipType,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      })
      .eq("id", ownershipId)
      .select()

    if (error) {
      throw new Error(`Failed to update ownership: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/units")
    revalidatePath("/admin/ownership")
    return { success: true, data }
  } catch (error) {
    console.error("Error editing unit ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to edit unit ownership")
  }
}

// ✅ NEW: Transfer unit ownership (Admin only)
export async function transferUnitOwnership(formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const ownershipId = formData.get("ownershipId") as string
    const newOwnerId = formData.get("newOwnerId") as string
    const transferDate = formData.get("transferDate") as string
    const transferReason = formData.get("transferReason") as string
    const partialTransfer = formData.get("partialTransfer") === "true"
    const transferPercentage = partialTransfer ? Number(formData.get("transferPercentage")) : 100

    if (!ownershipId || !newOwnerId) {
      throw new Error("Ownership ID and new owner are required")
    }

    // Get current ownership details
    const { data: currentOwnership, error: fetchError } = await supabase
      .from("unit_ownership")
      .select("*")
      .eq("id", ownershipId)
      .eq("is_active", true)
      .single()

    if (fetchError || !currentOwnership) {
      throw new Error("Ownership record not found")
    }

    if (partialTransfer) {
      // Partial transfer: Update current ownership and create new one
      const remainingPercentage = currentOwnership.ownership_percentage - transferPercentage

      if (remainingPercentage <= 0) {
        throw new Error("Transfer percentage cannot be greater than or equal to current ownership")
      }

      // Update current ownership with remaining percentage
      const { error: updateError } = await supabase
        .from("unit_ownership")
        .update({
          ownership_percentage: remainingPercentage,
        })
        .eq("id", ownershipId)

      if (updateError) {
        throw new Error(`Failed to update current ownership: ${updateError.message}`)
      }

      // Create new ownership for transferred portion
      const { data: newOwnership, error: createError } = await supabase
        .from("unit_ownership")
        .insert({
          owner_id: newOwnerId,
          unit_id: currentOwnership.unit_id,
          ownership_percentage: transferPercentage,
          ownership_type: "co-owner",
          start_date: transferDate || new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create new ownership: ${createError.message}`)
      }

      revalidatePath("/admin/residents")
      revalidatePath("/admin/ownership")
      return { success: true, data: { current: currentOwnership, new: newOwnership } }
    } else {
      // Full transfer: End current ownership and create new one
      const { error: endError } = await supabase
        .from("unit_ownership")
        .update({
          is_active: false,
          end_date: transferDate || new Date().toISOString(),
        })
        .eq("id", ownershipId)

      if (endError) {
        throw new Error(`Failed to end current ownership: ${endError.message}`)
      }

      // Create new ownership
      const { data: newOwnership, error: createError } = await supabase
        .from("unit_ownership")
        .insert({
          owner_id: newOwnerId,
          unit_id: currentOwnership.unit_id,
          ownership_percentage: currentOwnership.ownership_percentage,
          ownership_type: currentOwnership.ownership_type,
          start_date: transferDate || new Date().toISOString(),
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
    }
  } catch (error) {
    console.error("Error transferring ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to transfer ownership")
  }
}

// Add unit residency (Admin only)
export async function addUnitResidency(formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const unitId = formData.get("unitId") as string
    const residentId = formData.get("residentId") as string
    const residencyType = (formData.get("residencyType") as string) || "tenant"
    const startDate = formData.get("startDate") as string
    const isPrimaryResident = formData.get("isPrimaryResident") === "true"
    const monthlyRent = formData.get("monthlyRent") ? Number(formData.get("monthlyRent")) : null
    const leaseEndDate = (formData.get("leaseEndDate") as string) || null

    if (!unitId || !residentId) {
      throw new Error("Unit ID and Resident ID are required")
    }

    const { data, error } = await supabase
      .from("unit_residency")
      .insert({
        unit_id: unitId,
        resident_id: residentId,
        residency_type: residencyType,
        start_date: startDate,
        is_primary_resident: isPrimaryResident,
        is_active: true,
        monthly_rent: monthlyRent,
        lease_end_date: leaseEndDate,
      })
      .select()

    if (error) {
      throw new Error(`Failed to add residency: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/units")
    return { success: true, data }
  } catch (error) {
    console.error("Error adding unit residency:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add unit residency")
  }
}

// ✅ NEW: Edit unit residency (Admin only)
export async function editUnitResidency(residencyId: string, formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const residencyType = (formData.get("residencyType") as string) || "tenant"
    const startDate = formData.get("startDate") as string
    const endDate = (formData.get("endDate") as string) || null
    const isPrimaryResident = formData.get("isPrimaryResident") === "true"
    const isActive = formData.get("isActive") === "true"
    const monthlyRent = formData.get("monthlyRent") ? Number(formData.get("monthlyRent")) : null
    const leaseEndDate = (formData.get("leaseEndDate") as string) || null

    const { data, error } = await supabase
      .from("unit_residency")
      .update({
        residency_type: residencyType,
        start_date: startDate,
        end_date: endDate,
        is_primary_resident: isPrimaryResident,
        is_active: isActive,
        monthly_rent: monthlyRent,
        lease_end_date: leaseEndDate,
      })
      .eq("id", residencyId)
      .select()

    if (error) {
      throw new Error(`Failed to update residency: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    revalidatePath("/admin/units")
    return { success: true, data }
  } catch (error) {
    console.error("Error editing unit residency:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to edit unit residency")
  }
}

// ✅ NEW: Edit resident profile (Admin only)
export async function editResidentProfile(residentId: string, formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || null
    const profileType = (formData.get("profileType") as string) || "resident"
    const emergencyContactName = (formData.get("emergencyContactName") as string) || null
    const emergencyContactPhone = (formData.get("emergencyContactPhone") as string) || null
    const moveInDate = (formData.get("moveInDate") as string) || null
    const isVerified = formData.get("isVerified") === "true"

    if (!fullName || !email) {
      throw new Error("Full name and email are required")
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email: email,
        phone: phone,
        profile_type: profileType,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        move_in_date: moveInDate,
        is_verified: isVerified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", residentId)
      .eq("role", "resident")
      .select()

    if (error) {
      throw new Error(`Failed to update resident profile: ${error.message}`)
    }

    revalidatePath("/admin/residents")
    return { success: true, data }
  } catch (error) {
    console.error("Error editing resident profile:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to edit resident profile")
  }
}

// Get ownership statistics (Admin only)
export async function getOwnershipStats() {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    // Get total number of owned units
    const { count: totalOwnedUnits, error: ownedError } = await supabase
      .from("unit_ownership")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    if (ownedError) {
      throw new Error(`Failed to get owned units count: ${ownedError.message}`)
    }

    // Get all active ownerships with unit info
    const { data: ownerships, error: ownershipError } = await supabase
      .from("unit_ownership")
      .select(`
        unit_id,
        owner_id
      `)
      .eq("is_active", true)

    if (ownershipError) {
      throw new Error(`Failed to get ownership data: ${ownershipError.message}`)
    }

    // Get all active residencies
    const { data: residencies, error: residencyError } = await supabase
      .from("unit_residency")
      .select(`
        unit_id,
        resident_id
      `)
      .eq("is_active", true)

    if (residencyError) {
      throw new Error(`Failed to get residency data: ${residencyError.message}`)
    }

    // Calculate owner-occupied vs investment properties
    let ownerOccupied = 0
    let investmentProperties = 0

    ownerships?.forEach((ownership) => {
      const isOwnerOccupied = residencies?.some(
        (residency) => residency.unit_id === ownership.unit_id && residency.resident_id === ownership.owner_id,
      )

      if (isOwnerOccupied) {
        ownerOccupied++
      } else {
        investmentProperties++
      }
    })

    return {
      totalOwnedUnits: totalOwnedUnits || 0,
      ownerOccupied,
      investmentProperties,
    }
  } catch (error) {
    console.error("Error fetching ownership stats:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch ownership statistics")
  }
}

// Get resident statistics (Admin only)
export async function getResidentStats() {
  const { supabase } = await getAuthenticatedUser("admin")

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

    // Combine resident data with their unit information
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

// Delete resident (Admin only)
export async function deleteResident(id: string) {
  const { supabase } = await getAuthenticatedUser("admin")

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

// Update unit details (Admin only)
export async function updateUnit(unitId: string, formData: FormData) {
  const { supabase } = await getAuthenticatedUser("admin");
  try {
    const block = formData.get("block") as string;
    const unitNumber = formData.get("unit_number") as string;
    const status = formData.get("status") as string;
    const monthlyFee = formData.get("monthly_fee") ? Number(formData.get("monthly_fee")) : null;

    if (!block || !unitNumber || !status) {
      throw new Error("Block, unit number, and status are required");
    }

    const { data, error } = await supabase
      .from("units")
      .update({
        block,
        unit_number: unitNumber,
        status,
        monthly_fee: monthlyFee,
      })
      .eq("id", unitId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update unit: ${error.message}`);
    }

    revalidatePath("/admin/units");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating unit:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update unit");
  }
}

// ✅ NEW: Get ownership details by ID (Admin only)
export async function getOwnershipDetails(ownershipId: string) {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    const { data: ownership, error } = await supabase
      .from("unit_ownership")
      .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
        owner_id,
        unit_id,
        profiles!unit_ownership_owner_id_fkey (
          id,
          full_name,
          email,
          phone,
          profile_type,
          avatar_url,
          is_verified
        ),
        units!unit_ownership_unit_id_fkey (
          id,
          block,
          unit_number,
          status,
          monthly_fee
        )
      `)
      .eq("id", ownershipId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch ownership details: ${error.message}`)
    }

    if (!ownership) {
      throw new Error("Ownership record not found")
    }

    // Check if owner is also a resident (owner-occupied)
    const { data: residency } = await supabase
      .from("unit_residency")
      .select("id")
      .eq("unit_id", ownership.unit_id)
      .eq("resident_id", ownership.owner_id)
      .eq("is_active", true)
      .single()

    return {
      ...ownership,
      is_owner_occupied: !!residency,
    }
  } catch (error) {
    console.error("Error fetching ownership details:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch ownership details")
  }
}

// ✅ NEW: Get residents for assignment (Admin only) - Optimized version
export async function getResidentsForAssignment(page = 1, limit = 50, search = "") {
  const { supabase } = await getAuthenticatedUser("admin")

  try {
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        profile_type,
        created_at,
        avatar_url,
        is_verified
      `, { count: "exact" })
      .eq("role", "resident")
      .order("full_name")

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: residents, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch residents: ${error.message}`)
    }

    return {
      residents: residents || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    console.error("Error fetching residents for assignment:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch residents")
  }
}