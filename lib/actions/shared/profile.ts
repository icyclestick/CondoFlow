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

export async function getCurrentUserProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error("Profile not found");
  return profile;
}
