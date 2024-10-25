-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals active status" ON meals;

-- Create comprehensive policies
CREATE POLICY "Users can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meals"
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id);

-- Update the meals list component to filter active meals in the query