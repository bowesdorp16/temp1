-- Add active column to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Create index for active status
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(active);

-- Update RLS policies to consider active status
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
CREATE POLICY "Users can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id AND active = true);

-- Create policy for soft delete
CREATE POLICY "Users can update own meals active status"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to soft delete a meal
CREATE OR REPLACE FUNCTION soft_delete_meal(meal_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE meals
    SET active = false,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = meal_id
    AND auth.uid() = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;