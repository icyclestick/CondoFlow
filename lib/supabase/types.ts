export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          role: "admin" | "resident"
          unit_id: string | null
          email: string
          phone: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          full_name: string
          role?: "admin" | "resident"
          unit_id?: string | null
          email: string
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string
          role?: "admin" | "resident"
          unit_id?: string | null
          email?: string
          phone?: string | null
          avatar_url?: string | null
        }
      }
      units: {
        Row: {
          id: string
          created_at: string
          block: string
          unit_number: string
          status: "occupied" | "vacant"
          monthly_fee: number
        }
        Insert: {
          block: string
          unit_number: string
          status?: "occupied" | "vacant"
          monthly_fee: number
        }
        Update: {
          block?: string
          unit_number?: string
          status?: "occupied" | "vacant"
          monthly_fee?: number
        }
      }
      amenities: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          capacity: number
          hourly_rate: number | null
          image_url: string | null
        }
      }
      amenity_bookings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          amenity_id: string
          booking_date: string
          time_slot: string
          guests: number
          notes: string | null
          status: "pending" | "approved" | "rejected" | "completed"
        }
        Insert: {
          user_id: string
          amenity_id: string
          booking_date: string
          time_slot: string
          guests: number
          notes?: string | null
          status?: "pending" | "approved" | "rejected" | "completed"
        }
      }
      move_requests: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: "move-in" | "move-out"
          move_date: string
          preferred_time: string
          moving_company: string | null
          reason: string
          large_items: string | null
          status: "pending" | "approved" | "rejected" | "completed"
        }
        Insert: {
          user_id: string
          type: "move-in" | "move-out"
          move_date: string
          preferred_time: string
          moving_company?: string | null
          reason: string
          large_items?: string | null
          status?: "pending" | "approved" | "rejected" | "completed"
        }
      }
      gatepass_requests: {
        Row: {
          id: string
          created_at: string
          user_id: string
          transport_date: string
          transport_time: string
          reason: string
          items: any // JSON array of items
          notes: string | null
          status: "pending" | "approved" | "rejected" | "completed"
        }
        Insert: {
          user_id: string
          transport_date: string
          transport_time: string
          reason: string
          items: any
          notes?: string | null
          status?: "pending" | "approved" | "rejected" | "completed"
        }
      }
      service_requests: {
        Row: {
          id: string
          created_at: string
          user_id: string
          service_type: string
          preferred_schedule: string
          description: string
          urgency: "low" | "medium" | "high" | "emergency"
          status: "pending" | "assigned" | "in-progress" | "completed"
          assigned_to: string | null
        }
        Insert: {
          user_id: string
          service_type: string
          preferred_schedule: string
          description: string
          urgency?: "low" | "medium" | "high" | "emergency"
          status?: "pending" | "assigned" | "in-progress" | "completed"
          assigned_to?: string | null
        }
      }
      visitors: {
        Row: {
          id: string
          created_at: string
          user_id: string
          visitor_name: string
          visit_date: string
          time_in: string
          time_out: string | null
          reason: string
          vehicle_info: string | null
          status: "pending" | "approved" | "checked-in" | "checked-out"
        }
        Insert: {
          user_id: string
          visitor_name: string
          visit_date: string
          time_in: string
          time_out?: string | null
          reason: string
          vehicle_info?: string | null
          status?: "pending" | "approved" | "checked-in" | "checked-out"
        }
      }
      complaints: {
        Row: {
          id: string
          created_at: string
          user_id: string
          complaint_type: string
          location: string
          description: string
          urgency: "low" | "medium" | "high" | "emergency"
          image_url: string | null
          status: "pending" | "in-progress" | "resolved"
          admin_response: string | null
        }
        Insert: {
          user_id: string
          complaint_type: string
          location: string
          description: string
          urgency?: "low" | "medium" | "high" | "emergency"
          image_url?: string | null
          status?: "pending" | "in-progress" | "resolved"
          admin_response?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          amount: number
          payment_type: string
          payment_method: string
          payment_date: string
          due_date: string
          status: "pending" | "paid" | "overdue"
          receipt_url: string | null
        }
        Insert: {
          user_id: string
          amount: number
          payment_type: string
          payment_method: string
          payment_date: string
          due_date: string
          status?: "pending" | "paid" | "overdue"
          receipt_url?: string | null
        }
      }
    }
  }
}
