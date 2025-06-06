"use server"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  // Get user profile to determine role
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // Redirect based on role
    if (profile?.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/resident")
    }
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/auth/signin")
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
