"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

export async function getUnits() {
  const supabase = createServerSupabaseServiceClient()

  // Fetch all units with optimized query
  const { data: units, error } = await supabase
    .from("units")
    .select(`
       id,
       block,
       unit_number,
       status,
       monthly_fee,
       unit_residency(
        id,
        resident_id,
        is_active,
        is_primary_resident,
        start_date,
        end_date,
        profiles:resident_id (
        id,
        full_name,
        email,
        phone,
        avatar_url 
        )  
       )
      `)
    .order("block")
    .order("unit_number")

  if (error) {
    throw new Error(`Failed to fetch units: ${error.message}`)
  }

  return units
}

export async function getVacantUnits() {
  const supabase = createServerSupabaseServiceClient()

  const { data: units, error } = await supabase
    .from("units")
    .select("id, block, unit_number, status, monthly_fee")
    .eq("status", "vacant")
    .order("block")
    .order("unit_number")

  if (error) {
    throw new Error(`Failed to fetch vacant units: ${error.message}`)
  }

  return units
}

export async function getUnitsByBlock(block: string) {
  const supabase = createServerSupabaseServiceClient()

  const { data: units, error } = await supabase
    .from("units")
    .select("id, block, unit_number, status, monthly_fee")
    .eq("block", block)
    .order("unit_number")

  if (error) {
    throw new Error(`Failed to fetch units for block ${block}: ${error.message}`)
  }

  return units
}

export async function searchUnits(searchTerm: string, limit = 20) {
  const supabase = createServerSupabaseServiceClient()

  const { data: units, error } = await supabase
    .from("units")
    .select("id, block, unit_number, status, monthly_fee")
    .or(`unit_number.ilike.%${searchTerm}%,block.ilike.%${searchTerm}%`)
    .order("block")
    .order("unit_number")
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search units: ${error.message}`)
  }

  return units
}

// Update unit status
export async function updateUnitStatus(unitId: string, status: string) {
  const supabase = createServerSupabaseServiceClient()

  const { data, error } = await supabase
    .from("units")
    .update({ status })
    .eq("id", unitId)
    .select()

  if (error) {
    throw new Error(`Failed to update unit status: ${error.message}`)
  }

  return data
}

// Add new unit
export async function addUnit(formData: FormData) {
  const supabase = createServerSupabaseServiceClient()

  const block = formData.get("block") as string
  const unitNumber = formData.get("unitNumber") as string
  const monthlyFee = Number(formData.get("monthlyFee")) || 0
  const status = (formData.get("status") as string) || "vacant"

  if (!block || !unitNumber) {
    throw new Error("Block and unit number are required")
  }

  const { data, error } = await supabase
    .from("units")
    .insert({
      block,
      unit_number: unitNumber,
      monthly_fee: monthlyFee,
      status,
    })
    .select()

  if (error) {
    throw new Error(`Failed to add unit: ${error.message}`)
  }

  return data
}

// Delete unit
export async function deleteUnit(unitId: string) {
  const supabase = createServerSupabaseServiceClient()

  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", unitId)

  if (error) {
    throw new Error(`Failed to delete unit: ${error.message}`)
  }

  return { success: true }
}
