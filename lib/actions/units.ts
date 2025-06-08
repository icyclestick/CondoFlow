"use server"

import { createServerSupabaseServiceClient } from "../supabase/service-client"

export async function getUnits() {
  const supabase = createServerSupabaseServiceClient()

  // Fetch all units
  const { data: units, error } = await supabase
    .from("units")
    .select("id, block, unit_number, status")
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
    .select("id, block, unit_number, status")
    .eq("status", "vacant")
    .order("block")
    .order("unit_number")

  if (error) {
    throw new Error(`Failed to fetch vacant units: ${error.message}`)
  }

  return units
}
