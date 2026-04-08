-- Add migration script here

-- Add linked_wallets to the existing user_bundles table
ALTER TABLE user_bundles
ADD COLUMN linked_wallets JSONB NOT NULL DEFAULT '[]'::jsonb;

-- (Optional but Recommended) Create an index on linked_wallets.
-- If a user logs in with MetaMask, we need to quickly find out if that
-- MetaMask address is linked to a Primary Phantom account!
CREATE INDEX IF NOT EXISTS idx_user_bundles_linked_wallets
ON user_bundles USING GIN (linked_wallets);

-- Create a trigger to automatically update the 'updated_at' timestamp
-- every time the React frontend auto-saves the bundles_data!
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop it first in case it exists to avoid error if we run it again
DROP TRIGGER IF EXISTS update_user_bundles_modtime ON user_bundles;

CREATE TRIGGER update_user_bundles_modtime
    BEFORE UPDATE ON user_bundles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
