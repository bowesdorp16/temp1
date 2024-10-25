-- Add nutritional columns to meals table
ALTER TABLE meals 
ADD COLUMN calories INTEGER,
ADD COLUMN protein DECIMAL,
ADD COLUMN carbs DECIMAL,
ADD COLUMN fats DECIMAL,
ADD COLUMN analysis TEXT;