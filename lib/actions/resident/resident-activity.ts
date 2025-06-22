"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

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

// Activity item interface
export interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    status?: string;
    icon: string;
    link?: string;
}

// Get recent activity for resident
export async function getRecentActivity(limit: number = 10) {
    const { user, supabase } = await getAuthenticatedResident()

    try {
        const activities: ActivityItem[] = []

        // Get recent amenity bookings
        const { data: bookings } = await supabase
            .from("amenity_bookings")
            .select(`
                id,
                booking_date,
                time_slot,
                status,
                amenities:amenity_id (
                    name
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (bookings) {
            bookings.forEach(booking => {
                activities.push({
                    id: booking.id,
                    type: "amenity_booking",
                    title: `Booked ${booking.amenities?.name || "Amenity"}`,
                    description: `${booking.booking_date} at ${booking.time_slot}`,
                    date: booking.booking_date,
                    status: booking.status,
                    icon: "calendar",
                    link: "/resident/amenities"
                })
            })
        }

        // Get recent payments
        const { data: payments } = await supabase
            .from("payments")
            .select(`
                id,
                amount,
                payment_type,
                payment_date,
                due_date,
                status,
                created_at
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (payments) {
            payments.forEach(payment => {
                if (payment.status === "paid") {
                    activities.push({
                        id: payment.id,
                        type: "payment",
                        title: `Payment Made`,
                        description: `${payment.payment_type} - ${payment.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
                        date: payment.payment_date || payment.created_at,
                        status: payment.status,
                        icon: "credit-card",
                        link: "/resident/payments"
                    })
                } else {
                    activities.push({
                        id: payment.id,
                        type: "payment_due",
                        title: `Payment Due`,
                        description: `${payment.payment_type} - ${payment.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
                        date: payment.due_date,
                        status: payment.status,
                        icon: "alert-circle",
                        link: "/resident/payments"
                    })
                }
            })
        }

        // Get recent service requests
        const { data: serviceRequests } = await supabase
            .from("service_requests")
            .select(`
                id,
                service_type,
                description,
                status,
                created_at
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (serviceRequests) {
            serviceRequests.forEach(request => {
                activities.push({
                    id: request.id,
                    type: "service_request",
                    title: `Service Request: ${request.service_type}`,
                    description: request.description,
                    date: request.created_at,
                    status: request.status,
                    icon: "wrench",
                    link: "/resident/requests"
                })
            })
        }

        // Get recent visitor requests
        const { data: visitors } = await supabase
            .from("visitors")
            .select(`
                id,
                visitor_name,
                visit_date,
                status,
                created_at
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (visitors) {
            visitors.forEach(visitor => {
                activities.push({
                    id: visitor.id,
                    type: "visitor",
                    title: `Visitor: ${visitor.visitor_name}`,
                    description: `Visit on ${visitor.visit_date}`,
                    date: visitor.visit_date,
                    status: visitor.status,
                    icon: "user-plus",
                    link: "/resident/visitors"
                })
            })
        }

        // Get recent complaints
        const { data: complaints } = await supabase
            .from("complaints")
            .select(`
                id,
                complaint_type,
                description,
                status,
                created_at
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (complaints) {
            complaints.forEach(complaint => {
                activities.push({
                    id: complaint.id,
                    type: "complaint",
                    title: `Complaint: ${complaint.complaint_type}`,
                    description: complaint.description,
                    date: complaint.created_at,
                    status: complaint.status,
                    icon: "message-square",
                    link: "/resident/complaints"
                })
            })
        }

        // Get recent move requests
        const { data: moveRequests } = await supabase
            .from("move_requests")
            .select(`
                id,
                type,
                move_date,
                status,
                created_at
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (moveRequests) {
            moveRequests.forEach(request => {
                activities.push({
                    id: request.id,
                    type: "move_request",
                    title: `Move Request: ${request.type}`,
                    description: `Move date: ${request.move_date}`,
                    date: request.move_date,
                    status: request.status,
                    icon: "truck",
                    link: "/resident/move-requests"
                })
            })
        }

        // Sort all activities by date (most recent first) and limit
        const sortedActivities = activities
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit)

        return sortedActivities
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to fetch recent activity")
    }
} 