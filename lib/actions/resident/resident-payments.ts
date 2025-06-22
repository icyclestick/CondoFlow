"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Authentication & Authorization Helper
async function getAuthenticatedResident() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    // Verify user is a resident
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "resident") {
        throw new Error("Access denied. Resident role required.")
    }

    return { user, supabase }
}

// Get resident's own payments
export async function getMyPayments() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        units!payments_unit_id_fkey (
          id,
          block,
          unit_number
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch payments: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching payments:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payments")
    }
}

// Get resident's payment statistics
export async function getMyPaymentStats() {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("payments")
            .select("amount, status, due_date, payment_date")
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to fetch payment stats: ${error.message}`)
        }

        const currentDate = new Date()
        const totalPaid = data?.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) || 0
        const outstandingAmount = data?.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0
        const overdueAmount =
            data
                ?.filter((p) => p.status === "pending" && new Date(p.due_date) < currentDate)
                .reduce((sum, p) => sum + p.amount, 0) || 0

        const outstandingCount = data?.filter((p) => p.status === "pending").length || 0
        const overdueCount = data?.filter((p) => p.status === "pending" && new Date(p.due_date) < currentDate).length || 0

        return {
            totalPaid,
            outstandingAmount,
            overdueAmount,
            outstandingCount,
            overdueCount,
            totalPayments: data?.length || 0,
        }
    } catch (error) {
        console.error("Error fetching payment stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payment statistics")
    }
}

// Mark payment as paid (resident confirms payment)
export async function confirmPayment(paymentId: string, paymentMethod: string, paymentDate?: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        // Verify the payment belongs to the current user
        const { data: payment, error: fetchError } = await supabase
            .from("payments")
            .select("id, user_id")
            .eq("id", paymentId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !payment) {
            throw new Error("Payment not found or access denied")
        }

        const { error } = await supabase
            .from("payments")
            .update({
                status: "paid",
                payment_method: paymentMethod,
                payment_date: paymentDate || new Date().toISOString().split('T')[0],
            })
            .eq("id", paymentId)
            .eq("user_id", user.id)

        if (error) {
            throw new Error(`Failed to confirm payment: ${error.message}`)
        }

        revalidatePath("/resident/payments")
        return { success: true }
    } catch (error) {
        console.error("Error confirming payment:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to confirm payment")
    }
}

// Get payment receipt
export async function getPaymentReceipt(paymentId: string) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        units!payments_unit_id_fkey (
          id,
          block,
          unit_number
        )
      `)
            .eq("id", paymentId)
            .eq("user_id", user.id)
            .single()

        if (error || !data) {
            throw new Error("Payment not found or access denied")
        }

        return data
    } catch (error) {
        console.error("Error fetching payment receipt:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payment receipt")
    }
} 