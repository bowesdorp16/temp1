-- Add tokens column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens INTEGER NOT NULL DEFAULT 0;

-- Create token_purchases table
CREATE TABLE IF NOT EXISTS token_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    tokens INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_intent_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on token_purchases
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for token_purchases
CREATE POLICY "Users can view own token purchases"
    ON token_purchases
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert token purchases"
    ON token_purchases
    FOR INSERT
    WITH CHECK (
        -- Allow service role or authenticated users to create their own purchases
        (auth.uid() = user_id) OR
        (auth.role() = 'service_role')
    );

CREATE POLICY "Only service role can update token purchases"
    ON token_purchases
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create function to increment user tokens
CREATE OR REPLACE FUNCTION increment_user_tokens(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
    -- Only allow incrementing tokens if called by service role
    IF auth.role() = 'service_role' THEN
        UPDATE profiles
        SET tokens = tokens + amount
        WHERE id = user_id;
    ELSE
        RAISE EXCEPTION 'Only service role can increment tokens';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON token_purchases TO authenticated;
GRANT INSERT ON token_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_tokens TO service_role;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON token_purchases(status);
CREATE INDEX IF NOT EXISTS idx_token_purchases_created_at ON token_purchases(created_at);

-- Add trigger to update tokens count after purchase completion
CREATE OR REPLACE FUNCTION handle_completed_purchase()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM increment_user_tokens(NEW.user_id, NEW.tokens);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_purchase_completed
    AFTER UPDATE ON token_purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_completed_purchase();