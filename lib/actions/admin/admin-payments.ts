"use server"

import { createServerSupabaseServiceClient } from "@/lib/supabase/service-client"
import { revalidatePath } from "next/cache"

// Payment types and interfaces
export interface PaymentData {
    user_id: string;
    unit_id: string;
    amount: number;
    type: string;
    due_date: string;
    description?: string;
    payment_method?: string;
}

export interface BulkPaymentData {
    unit_ids: string[];
    amount: number;
    type: string;
    due_date: string;
}

// Get all payments (Admin only)
export async function getAllPayments() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        profiles!payments_user_id_fkey (
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

        // Calculate overdue status for pending payments
        const paymentsWithOverdue = (data || []).map(payment => {
            const isOverdue = payment.status === "pending" && new Date(payment.due_date) < new Date();
            return {
                ...payment,
                status: isOverdue ? "overdue" : payment.status
            };
        });

        return paymentsWithOverdue
    } catch (error) {
        console.error("Error fetching payments:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payments")
    }
}

// Create a single payment (Admin only)
export async function createPayment(formData: FormData) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const userId = formData.get("userId") as string
        const unitId = formData.get("unitId") as string
        const amount = Number.parseFloat(formData.get("amount") as string)
        const type = formData.get("type") as string
        const dueDate = formData.get("dueDate") as string

        if (!unitId || !amount || !type || !dueDate) {
            throw new Error("Unit, amount, type, and due date are required")
        }

        // If userId is not provided, find the resident of the unit
        let finalUserId = userId;
        if (!finalUserId) {
            const { data: residency, error: residencyError } = await supabase
                .from("unit_residency")
                .select("resident_id")
                .eq("unit_id", unitId)
                .eq("is_active", true)
                .eq("is_primary_resident", true)
                .single()

            if (residencyError || !residency) {
                // Get unit details for better error message
                const { data: unit } = await supabase
                    .from("units")
                    .select("block, unit_number, status")
                    .eq("id", unitId)
                    .single()

                const unitInfo = unit ? `Block ${unit.block} - Unit ${unit.unit_number} (${unit.status})` : `Unit ID: ${unitId}`;
                throw new Error(`No active resident found for ${unitInfo}. Please ensure the unit has an assigned resident or manually select a resident.`)
            }

            finalUserId = residency.resident_id;
        }

        const { data, error } = await supabase
            .from("payments")
            .insert({
                user_id: finalUserId,
                unit_id: unitId,
                amount: amount,
                payment_type: type,
                due_date: dueDate,
                payment_date: dueDate,
                payment_method: "pending",
                status: "pending",
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create payment: ${error.message}`)
        }

        revalidatePath("/admin/payments")
        return { success: true, data }
    } catch (error) {
        console.error("Error creating payment:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create payment")
    }
}

// Create bulk payments (e.g., monthly dues for all units)
export async function createBulkPayments(bulkData: BulkPaymentData) {
    const supabase = createServerSupabaseServiceClient()

    try {
        // Get all residents for the specified units
        const { data: residencies, error: residencyError } = await supabase
            .from("unit_residency")
            .select(`
                resident_id,
                unit_id
            `)
            .in("unit_id", bulkData.unit_ids)
            .eq("is_active", true)

        if (residencyError) {
            throw new Error(`Failed to fetch unit residencies: ${residencyError.message}`)
        }

        if (!residencies || residencies.length === 0) {
            throw new Error("No active residents found for any of the specified units")
        }

        // Create payment records for each resident
        const paymentRecords = residencies.map(residency => ({
            user_id: residency.resident_id,
            unit_id: residency.unit_id,
            amount: bulkData.amount,
            payment_type: bulkData.type,
            due_date: bulkData.due_date,
            payment_date: bulkData.due_date,
            payment_method: "pending",
            status: "pending",
            created_at: new Date().toISOString(),
        }))

        const { data, error } = await supabase
            .from("payments")
            .insert(paymentRecords)
            .select()

        if (error) {
            throw new Error(`Failed to create bulk payments: ${error.message}`)
        }

        // Calculate summary
        const successfulCount = paymentRecords.length;
        const skippedCount = bulkData.unit_ids.length - successfulCount;

        let summaryMessage = `Successfully created ${successfulCount} payment(s)`;
        if (skippedCount > 0) {
            summaryMessage += `. Skipped ${skippedCount} unit(s) without active residents.`;
        }

        revalidatePath("/admin/payments")
        return {
            success: true,
            data,
            count: paymentRecords.length,
            summary: summaryMessage,
            successfulCount,
            skippedCount
        }
    } catch (error) {
        console.error("Error creating bulk payments:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create bulk payments")
    }
}

// Get all units for payment creation
export async function getAllUnits() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("units")
            .select(`
                id,
                block,
                unit_number,
                status,
                monthly_fee
            `)
            .order("block")
            .order("unit_number")

        if (error) {
            throw new Error(`Failed to fetch units: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching units:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch units")
    }
}

// Get all residents for payment creation
export async function getAllResidents() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                email,
                phone
            `)
            .eq("role", "resident")
            .order("full_name")

        if (error) {
            throw new Error(`Failed to fetch residents: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error("Error fetching residents:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch residents")
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
                payment_date: paymentDate || new Date().toISOString().split('T')[0],
            })
            .eq("id", paymentId)

        if (error) {
            throw new Error(`Failed to mark payment as paid: ${error.message}`)
        }

        revalidatePath("/admin/payments")
        return { success: true }
    } catch (error) {
        console.error("Error marking payment as paid:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to mark payment as paid")
    }
}

// Delete a payment (Admin only)
export async function deletePayment(paymentId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        const { error } = await supabase
            .from("payments")
            .delete()
            .eq("id", paymentId)

        if (error) {
            throw new Error(`Failed to delete payment: ${error.message}`)
        }

        revalidatePath("/admin/payments")
        return { success: true }
    } catch (error) {
        console.error("Error deleting payment:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to delete payment")
    }
}

export async function generateReceipt(paymentId: string) {
    const supabase = createServerSupabaseServiceClient()

    try {
        // Get payment details for receipt
        const { data: payment, error } = await supabase
            .from("payments")
            .select(`
                *,
                profiles!payments_user_id_fkey (
                    full_name,
                    email
                ),
                units!payments_unit_id_fkey (
                    block,
                    unit_number
                )
            `)
            .eq("id", paymentId)
            .single()

        if (error || !payment) {
            throw new Error("Payment not found")
        }

        // This would typically generate a PDF receipt and send it to the resident
        // For now, we'll just log the action and return the payment data
        console.log(`Generating receipt for payment ${paymentId}`)

        // You could implement actual receipt generation here
        // For example, using a PDF library or sending an email

        return { success: true, payment }
    } catch (error) {
        console.error("Error generating receipt:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to generate receipt")
    }
}

// Send payment reminders (Admin only)
export async function sendPaymentReminders() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const currentDate = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(currentDate.getDate() + 3)

        // Get payments due in the next 3 days
        const { data: upcomingPayments, error: upcomingError } = await supabase
            .from("payments")
            .select(`
                *,
                profiles!payments_user_id_fkey (
                    full_name,
                    email,
                    phone
                ),
                units!payments_unit_id_fkey (
                    block,
                    unit_number
                )
            `)
            .eq("status", "pending")
            .gte("due_date", currentDate.toISOString().split('T')[0])
            .lte("due_date", threeDaysFromNow.toISOString().split('T')[0])

        if (upcomingError) {
            throw new Error(`Failed to fetch upcoming payments: ${upcomingError.message}`)
        }

        // Get overdue payments
        const { data: overduePayments, error: overdueError } = await supabase
            .from("payments")
            .select(`
                *,
                profiles!payments_user_id_fkey (
                    full_name,
                    email,
                    phone
                ),
                units!payments_unit_id_fkey (
                    block,
                    unit_number
                )
            `)
            .eq("status", "pending")
            .lt("due_date", currentDate.toISOString().split('T')[0])

        if (overdueError) {
            throw new Error(`Failed to fetch overdue payments: ${overdueError.message}`)
        }

        // Here you would integrate with your notification system
        // For now, we'll just log the reminders
        const reminders = {
            upcoming: upcomingPayments || [],
            overdue: overduePayments || [],
            totalUpcoming: upcomingPayments?.length || 0,
            totalOverdue: overduePayments?.length || 0,
        }

        console.log("Payment reminders generated:", reminders)

        // Example notification logic (you would replace this with actual email/SMS service)
        // await sendEmailReminders(reminders.upcoming, "upcoming")
        // await sendEmailReminders(reminders.overdue, "overdue")

        return reminders
    } catch (error) {
        console.error("Error sending payment reminders:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to send payment reminders")
    }
}

// Get payment analytics for dashboard
export async function getPaymentAnalytics() {
    const supabase = createServerSupabaseServiceClient()

    try {
        const currentDate = new Date()
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)

        const { data, error } = await supabase
            .from("payments")
            .select("amount, status, due_date, payment_date, type")

        if (error) {
            throw new Error(`Failed to fetch payment analytics: ${error.message}`)
        }

        // Monthly trends
        const currentMonthPayments = data?.filter(p =>
            p.payment_date && new Date(p.payment_date) >= currentMonth
        ) || []

        const lastMonthPayments = data?.filter(p =>
            p.payment_date && new Date(p.payment_date) >= lastMonth && new Date(p.payment_date) < currentMonth
        ) || []

        const currentMonthRevenue = currentMonthPayments
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0)

        const lastMonthRevenue = lastMonthPayments
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0)

        // Payment type breakdown
        const typeBreakdown = data?.reduce((acc, payment) => {
            const type = payment.type || "unknown"
            if (!acc[type]) {
                acc[type] = { total: 0, paid: 0, pending: 0, overdue: 0 }
            }
            acc[type].total += payment.amount
            if (payment.status === "paid") {
                acc[type].paid += payment.amount
            } else if (payment.status === "pending") {
                if (new Date(payment.due_date) < currentDate) {
                    acc[type].overdue += payment.amount
                } else {
                    acc[type].pending += payment.amount
                }
            }
            return acc
        }, {} as Record<string, { total: number; paid: number; pending: number; overdue: number }>) || {}

        // Collection rate by month
        const monthlyCollectionRates = []
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)

            const monthPayments = data?.filter(p =>
                p.due_date && new Date(p.due_date) >= monthStart && new Date(p.due_date) <= monthEnd
            ) || []

            const totalAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0)
            const paidAmount = monthPayments
                .filter(p => p.status === "paid")
                .reduce((sum, p) => sum + p.amount, 0)

            const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

            monthlyCollectionRates.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                collectionRate: Math.round(collectionRate * 10) / 10,
                totalAmount,
                paidAmount
            })
        }

        return {
            currentMonthRevenue,
            lastMonthRevenue,
            revenueChange: lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
            typeBreakdown,
            monthlyCollectionRates: monthlyCollectionRates.reverse(),
            totalPayments: data?.length || 0,
            paidPayments: data?.filter(p => p.status === "paid").length || 0,
            pendingPayments: data?.filter(p => p.status === "pending").length || 0,
            overduePayments: data?.filter(p => p.status === "pending" && new Date(p.due_date) < currentDate).length || 0,
        }
    } catch (error) {
        console.error("Error fetching payment analytics:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch payment analytics")
    }
}
