"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getUnits() {
  const supabase = await createServerSupabaseClient()

  // Check if the current user is an admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  // Verify admin role
  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Only administrators can access unit data")
  }

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
  const supabase = await createServerSupabaseClient()

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
