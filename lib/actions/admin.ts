"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"

export async function createResidentAccount(formData: FormData) {
  // 1. Use anon client for session/user checks
  const userClient = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  // Verify admin role
  const { data: adminProfile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Only administrators can create resident accounts")
  }

  // 2. Use service role client for admin actions
  const supabase = createServerSupabaseServiceClient()

  // Extract form data
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const fullName = `${firstName} ${lastName}`
  const phone = formData.get("phone") as string
  const unitId = formData.get("unitId") as string
  const moveInDate = formData.get("moveInDate") as string
  const initialPassword = formData.get("initialPassword") as string
  const residencyType = (formData.get("residencyType") as string) || "tenant"

  // Create the user account in Supabase Auth
  const { data: authData, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password: initialPassword,
    email_confirm: true, // Auto-confirm the email
    user_metadata: {
      full_name: fullName,
    },
  })

  if (signupError) {
    throw new Error(`Failed to create user account: ${signupError.message}`)
  }

  // Update the profile with additional information
  if (authData.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        role: "resident",
        profile_type: "resident",
        move_in_date: moveInDate,
      })
      .eq("id", authData.user.id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // Create unit residency record if unit is provided
    if (unitId) {
      const { error: residencyError } = await supabase.from("unit_residency").insert({
        unit_id: unitId,
        resident_id: authData.user.id,
        residency_type: residencyType,
        start_date: moveInDate,
        is_primary_resident: true,
        is_active: true,
      })

      if (residencyError) {
        throw new Error(`Failed to create unit residency: ${residencyError.message}`)
      }

      // Update unit status to occupied
      await supabase.from("units").update({ status: "occupied" }).eq("id", unitId)
    }
  }

  revalidatePath("/admin/residents")
  return { success: true }
}
