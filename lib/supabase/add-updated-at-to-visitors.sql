-- Add updated_at column to visitors table
ALTER TABLE visitors ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_visitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_visitors_updated_at_trigger
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_visitors_updated_at(); 