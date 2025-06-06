-- Drop existing foreign key constraint
ALTER TABLE profiles DROP COLUMN IF EXISTS unit_id;

-- Create a junction table for unit ownership
CREATE TABLE unit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00, -- For co-ownership
  ownership_type TEXT CHECK (ownership_type IN ('primary', 'co-owner', 'beneficiary')) DEFAULT 'primary',
  start_date DATE NOT NULL,
  end_date DATE, -- For when ownership is transferred
  is_active BOOLEAN DEFAULT true,
  UNIQUE(unit_id, owner_id, start_date)
);

-- Create a junction table for unit residency (who lives there)
CREATE TABLE unit_residency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  residency_type TEXT CHECK (residency_type IN ('owner-occupied', 'tenant', 'family-member', 'guest')) DEFAULT 'tenant',
  start_date DATE NOT NULL,
  end_date DATE, -- For when they move out
  is_primary_resident BOOLEAN DEFAULT false, -- Main contact for the unit
  is_active BOOLEAN DEFAULT true,
  monthly_rent DECIMAL(10,2), -- If they're a tenant
  lease_end_date DATE, -- If they're a tenant
  UNIQUE(unit_id, resident_id, start_date)
);

-- Update profiles table to remove direct unit relationship and add new fields
-- First, drop the unit_id column if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS unit_id;

-- Add new columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_type TEXT CHECK (profile_type IN ('owner', 'resident', 'both', 'admin')) DEFAULT 'resident',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unit_ownership_unit_id ON unit_ownership(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_ownership_owner_id ON unit_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_unit_ownership_active ON unit_ownership(is_active);
CREATE INDEX IF NOT EXISTS idx_unit_residency_unit_id ON unit_residency(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_residency_resident_id ON unit_residency(resident_id);
CREATE INDEX IF NOT EXISTS idx_unit_residency_active ON unit_residency(is_active);

-- RLS Policies for new tables
ALTER TABLE unit_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_residency ENABLE ROW LEVEL SECURITY;

-- Ownership policies
CREATE POLICY "Users can view ownership of their units" ON unit_ownership
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM unit_residency 
      WHERE unit_id = unit_ownership.unit_id 
      AND resident_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all ownership" ON unit_ownership
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Residency policies
CREATE POLICY "Users can view residency of their units" ON unit_residency
  FOR SELECT USING (
    resident_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM unit_ownership 
      WHERE unit_id = unit_residency.unit_id 
      AND owner_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all residency" ON unit_residency
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
