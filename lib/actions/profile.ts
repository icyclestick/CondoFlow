"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  const fullName = `${formData.get("firstName")} ${formData.get("lastName")}`
  const phone = formData.get("phone") as string
  const emergencyContact = formData.get("emergencyContact") as string

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone,
      emergency_contact: emergencyContact,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath("/resident/profile")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const newPassword = formData.get("newPassword") as string

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(`Failed to change password: ${error.message}`)
  }

  return { success: true }
}
