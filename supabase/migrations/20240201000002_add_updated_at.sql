-- Add updated_at column to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Create trigger function for handling updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for meals updated_at
CREATE TRIGGER meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();