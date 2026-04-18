-- Add migration script here

INSERT INTO linked_wallets (primary_wallet, address, wallet_id, name, address_type)
SELECT
    wallet_address AS primary_wallet,
    jsonb_array_elements_text(linked_wallets) AS address,
    'unknown'       AS wallet_id,
    'Linked Wallet' AS name,
    'Solana'        AS address_type
FROM user_bundles
WHERE linked_wallets != '[]'::jsonb;

ALTER TABLE user_bundles DROP COLUMN linked_wallets;
