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
          email: string
          phone: string | null
          avatar_url: string | null
          profile_type: "owner" | "resident" | "both" | "admin"
          is_verified: boolean
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          move_in_date: string | null
        }
        Insert: {
          id: string
          full_name: string
          role?: "admin" | "resident"
          email: string
          phone?: string | null
          avatar_url?: string | null
          profile_type?: "owner" | "resident" | "both" | "admin"
          is_verified?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          move_in_date?: string | null
        }
        Update: {
          full_name?: string
          role?: "admin" | "resident"
          email?: string
          phone?: string | null
          avatar_url?: string | null
          profile_type?: "owner" | "resident" | "both" | "admin"
          is_verified?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          move_in_date?: string | null
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
      unit_ownership: {
        Row: {
          id: string
          created_at: string
          unit_id: string
          owner_id: string
          ownership_percentage: number
          ownership_type: "primary" | "co-owner" | "beneficiary"
          start_date: string
          end_date: string | null
          is_active: boolean
        }
        Insert: {
          unit_id: string
          owner_id: string
          ownership_percentage?: number
          ownership_type?: "primary" | "co-owner" | "beneficiary"
          start_date: string
          end_date?: string | null
          is_active?: boolean
        }
        Update: {
          ownership_percentage?: number
          ownership_type?: "primary" | "co-owner" | "beneficiary"
          start_date?: string
          end_date?: string | null
          is_active?: boolean
        }
      }
      unit_residency: {
        Row: {
          id: string
          created_at: string
          unit_id: string
          resident_id: string
          residency_type: "owner-occupied" | "tenant" | "family-member" | "guest"
          start_date: string
          end_date: string | null
          is_primary_resident: boolean
          is_active: boolean
          monthly_rent: number | null
          lease_end_date: string | null
        }
        Insert: {
          unit_id: string
          resident_id: string
          residency_type?: "owner-occupied" | "tenant" | "family-member" | "guest"
          start_date: string
          end_date?: string | null
          is_primary_resident?: boolean
          is_active?: boolean
          monthly_rent?: number | null
          lease_end_date?: string | null
        }
        Update: {
          residency_type?: "owner-occupied" | "tenant" | "family-member" | "guest"
          start_date?: string
          end_date?: string | null
          is_primary_resident?: boolean
          is_active?: boolean
          monthly_rent?: number | null
          lease_end_date?: string | null
        }
      }
      // ... other existing tables
    }
  }
}

// Enhanced interfaces for the frontend
export interface UnitOwnership {
  id: string
  unit_id: string
  owner_id: string
  ownership_percentage: number
  ownership_type: "primary" | "co-owner" | "beneficiary"
  start_date: string
  end_date: string | null
  is_active: boolean
  owner?: Profile
  unit?: Unit
}

export interface UnitResidency {
  id: string
  unit_id: string
  resident_id: string
  residency_type: "owner-occupied" | "tenant" | "family-member" | "guest"
  start_date: string
  end_date: string | null
  is_primary_resident: boolean
  is_active: boolean
  monthly_rent: number | null
  lease_end_date: string | null
  resident?: Profile
  unit?: Unit
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  role: "admin" | "resident"
  email: string
  phone: string | null
  avatar_url: string | null
  profile_type: "owner" | "resident" | "both" | "admin"
  is_verified: boolean
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  move_in_date: string | null
}

export interface Unit {
  id: string
  created_at: string
  block: string
  unit_number: string
  status: "occupied" | "vacant"
  monthly_fee: number
}

export interface UnitWithDetails extends Unit {
  owners: UnitOwnership[]
  residents: UnitResidency[]
  primary_resident?: Profile
  primary_owner?: Profile
}
