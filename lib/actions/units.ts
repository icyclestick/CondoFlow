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
       unit_residency!inner(
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
    .eq("unit_residency.is_active", true)
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
