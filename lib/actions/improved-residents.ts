"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseServiceClient } from "../supabase/service-client"

// Get all residents with their unit relationships (Admin only)
export async function getAllResidentsWithUnits() {
  const supabase = createServerSupabaseServiceClient();

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

// Get all unit owners (Admin only)
export async function getAllUnitOwners() {
  const supabase = createServerSupabaseServiceClient();

  try {
    const { data: owners, error } = await supabase
      .from("unit_ownership")
      .select(`
        id,
        ownership_percentage,
        ownership_type,
        start_date,
        end_date,
        is_active,
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

    return owners || []
  } catch (error) {
    console.error("Error fetching unit owners:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch unit owners")
  }
}

// Get unit details with all owners and residents (Admin only)
export async function getUnitWithDetails(unitId: string) {
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
  const supabase = createServerSupabaseServiceClient();

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
