CREATE TABLE IF NOT EXISTS linked_wallets (
    address VARCHAR(64) PRIMARY KEY, -- B-tree index, ensures a wallet is only linked once
    primary_wallet VARCHAR(64) NOT NULL REFERENCES user_bundles(wallet_address) ON DELETE CASCADE,
    wallet_id VARCHAR(50) NOT NULL,  -- e.g., "phantom", "solflare"
    name VARCHAR(100),               -- e.g., "My Vault Wallet"
    address_type VARCHAR(20) NOT NULL -- e.g., "Solana", "Ethereum"
);

-- Index for fast lookups of all wallets belonging to a primary account
CREATE INDEX idx_linked_wallets_primary ON linked_wallets(primary_wallet);
