-- First, drop all existing policies for meals table
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can create own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals active status" ON meals;

-- Enable RLS if not already enabled
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies
-- Allow users to view their own meals
CREATE POLICY "Users can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own meals
CREATE POLICY "Users can create own meals"
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own meals
CREATE POLICY "Users can update own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own meals (though we're using soft delete)
CREATE POLICY "Users can delete own meals"
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON meals TO authenticated;

-- Create helper function for soft delete with proper security context
CREATE OR REPLACE FUNCTION soft_delete_meal(meal_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE meals
    SET 
        active = false,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE 
        id = meal_id 
        AND user_id = auth.uid();
END;
$$;