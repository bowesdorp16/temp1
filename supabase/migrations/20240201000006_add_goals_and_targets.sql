-- Add goal-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN goal TEXT CHECK (goal IN ('lean_bulk', 'mass_gain', 'strength')),
ADD COLUMN activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')),
ADD COLUMN target_calories INTEGER,
ADD COLUMN target_protein DECIMAL(10,2),
ADD COLUMN target_carbs DECIMAL(10,2),
ADD COLUMN target_fats DECIMAL(10,2);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_goal ON profiles(goal);
CREATE INDEX IF NOT EXISTS idx_profiles_activity_level ON profiles(activity_level);