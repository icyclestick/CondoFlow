"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Get all residents with their unit relationships
export async function getAllResidentsWithUnits() {
  const supabase = await createServerSupabaseClient()

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
      .in("role", ["resident"])
      .order("full_name")

    if (error) {
      throw new Error(`Failed to fetch residents: ${error.message}`)
    }

    // Get unit relationships for each resident
    const residentsWithUnits = await Promise.all(
      (residents || []).map(async (resident) => {
        // Get units they own
        const { data: ownedUnits } = await supabase
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

        // Get units they live in
        const { data: residingUnits } = await supabase
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

// Get all unit owners
export async function getAllUnitOwners() {
  const supabase = await createServerSupabaseClient()

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
        profiles (
          id,
          full_name,
          email,
          phone,
          profile_type,
          avatar_url,
          is_verified
        ),
        units (
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

// Get unit details with all owners and residents
export async function getUnitWithDetails(unitId: string) {
  const supabase = await createServerSupabaseClient()

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

// Add unit ownership
export async function addUnitOwnership(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    const unitId = formData.get("unitId") as string
    const ownerId = formData.get("ownerId") as string
    const ownershipPercentage = Number(formData.get("ownershipPercentage")) || 100
    const ownershipType = (formData.get("ownershipType") as string) || "primary"
    const startDate = formData.get("startDate") as string

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
    return { success: true, data }
  } catch (error) {
    console.error("Error adding unit ownership:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add unit ownership")
  }
}

// Add unit residency
export async function addUnitResidency(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  try {
    const unitId = formData.get("unitId") as string
    const residentId = formData.get("residentId") as string
    const residencyType = (formData.get("residencyType") as string) || "tenant"
    const startDate = formData.get("startDate") as string
    const isPrimaryResident = formData.get("isPrimaryResident") === "true"
    const monthlyRent = formData.get("monthlyRent") ? Number(formData.get("monthlyRent")) : null
    const leaseEndDate = (formData.get("leaseEndDate") as string) || null

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
