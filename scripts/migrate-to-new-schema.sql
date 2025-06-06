-- Migration script to transition from old schema to new schema
-- Run this AFTER applying the improved schema

-- This script will help migrate any existing data from the old unit_id column
-- to the new unit_ownership and unit_residency tables

-- First, let's see if there's any existing data to migrate
DO $$
DECLARE
    old_data_exists BOOLEAN := FALSE;
BEGIN
    -- Check if there are any profiles with unit assignments in the old format
    -- (This would only work if the old unit_id column still exists)
    
    -- For now, we'll just create some sample data for testing
    -- In a real migration, you'd query the old data first
    
    RAISE NOTICE 'Migration script ready. Add actual migration logic here if needed.';
    
    -- Example of how you might migrate old data:
    -- INSERT INTO unit_residency (unit_id, resident_id, residency_type, start_date, is_primary_resident, is_active)
    -- SELECT unit_id, id, 'tenant', COALESCE(move_in_date, created_at::date), true, true
    -- FROM profiles 
    -- WHERE unit_id IS NOT NULL AND role = 'resident';
    
END $$;
