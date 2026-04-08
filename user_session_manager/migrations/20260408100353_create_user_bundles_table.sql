-- Add migration script here
CREATE TABLE IF NOT EXISTS user_bundles (
    wallet_address VARCHAR(44) PRIMARY KEY,
    -- We use JSONB to store the massive nested array of template data
    bundles_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
