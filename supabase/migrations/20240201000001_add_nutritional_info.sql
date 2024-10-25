-- Add nutritional information columns to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS protein DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS carbs DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fats DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS analysis TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_calories ON meals(calories);
CREATE INDEX IF NOT EXISTS idx_meals_protein ON meals(protein);

-- Add constraints to ensure valid nutritional values
ALTER TABLE meals
ADD CONSTRAINT calories_non_negative CHECK (calories >= 0),
ADD CONSTRAINT protein_non_negative CHECK (protein >= 0),
ADD CONSTRAINT carbs_non_negative CHECK (carbs >= 0),
ADD CONSTRAINT fats_non_negative CHECK (fats >= 0);

-- Create a function to calculate total daily nutrition
CREATE OR REPLACE FUNCTION get_daily_nutrition(user_id UUID, date_param DATE)
RETURNS TABLE (
    total_calories INTEGER,
    total_protein DECIMAL(10,2),
    total_carbs DECIMAL(10,2),
    total_fats DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(calories)::INTEGER, 0) as total_calories,
        COALESCE(SUM(protein), 0.0) as total_protein,
        COALESCE(SUM(carbs), 0.0) as total_carbs,
        COALESCE(SUM(fats), 0.0) as total_fats
    FROM meals
    WHERE meals.user_id = get_daily_nutrition.user_id
    AND DATE(meals.date) = date_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate weekly nutrition
CREATE OR REPLACE FUNCTION get_weekly_nutrition(user_id UUID, start_date DATE)
RETURNS TABLE (
    total_calories INTEGER,
    total_protein DECIMAL(10,2),
    total_carbs DECIMAL(10,2),
    total_fats DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(calories)::INTEGER, 0) as total_calories,
        COALESCE(SUM(protein), 0.0) as total_protein,
        COALESCE(SUM(carbs), 0.0) as total_carbs,
        COALESCE(SUM(fats), 0.0) as total_fats
    FROM meals
    WHERE meals.user_id = get_weekly_nutrition.user_id
    AND DATE(meals.date) BETWEEN start_date AND (start_date + INTERVAL '6 days');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_daily_nutrition TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_nutrition TO authenticated;