"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

export async function getAllPayments() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        profiles!payments_resident_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        units!payments_unit_id_fkey (
          id,
          block,
          unit_number
        )
      `)
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

export async function getPaymentStats() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const { data, error } = await supabase.from("payments").select("amount, status, due_date, payment_date")

        if (error) {
            throw new Error(`Failed to fetch payment stats: ${error.message}`)
        }

        const currentDate = new Date()
        const totalRevenue = data?.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) || 0
        const outstandingAmount = data?.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0
        const overdueAmount =
            data
                ?.filter((p) => p.status === "pending" && new Date(p.due_date) < currentDate)
                .reduce((sum, p) => sum + p.amount, 0) || 0

        const outstandingCount = data?.filter((p) => p.status === "pending").length || 0
        const overdueCount = data?.filter((p) => p.status === "pending" && new Date(p.due_date) < currentDate).length || 0

        const totalAmount = totalRevenue + outstandingAmount
        const collectionRate = totalAmount > 0 ? (totalRevenue / totalAmount) * 100 : 0

        return {
            totalRevenue,
            outstandingAmount,
            collectionRate: Math.round(collectionRate * 10) / 10,
            overdueAmount,
            outstandingCount,
            overdueCount,
        }
    } catch (error) {
        console.error("Error fetching payment stats:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payment statistics")
    }
}

export async function markPaymentAsPaid(paymentId: string, paymentMethod: string, paymentDate?: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("payments")
            .update({
                status: "paid",
                payment_method: paymentMethod,
                payment_date: paymentDate || new Date().toISOString(),
            })
            .eq("id", paymentId)

        if (error) {
            throw new Error(`Failed to mark payment as paid: ${error.message}`)
        }

        revalidatePath("/admin/payments")
    } catch (error) {
        console.error("Error marking payment as paid:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to mark payment as paid")
    }
}

export async function generateReceipt(paymentId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        // This would typically generate a PDF receipt and send it to the resident
        // For now, we'll just log the action
        console.log(`Generating receipt for payment ${paymentId}`)

        // You could implement actual receipt generation here
        // For example, using a PDF library or sending an email

        return { success: true }
    } catch (error) {
        console.error("Error generating receipt:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to generate receipt")
    }
}
