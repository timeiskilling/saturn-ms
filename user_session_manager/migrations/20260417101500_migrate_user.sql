-- Add migration script here

-- Крок 1: Мігруємо існуючі дані зі старої JSONB колонки
-- jsonb_array_elements_text() розгортає масив рядків у окремі рядки
INSERT INTO linked_wallets (primary_wallet, address, wallet_id, name, address_type)
SELECT
    wallet_address AS primary_wallet,
    jsonb_array_elements_text(linked_wallets) AS address,
    'unknown'       AS wallet_id,   -- чесно позначаємо невідоме
    'Linked Wallet' AS name,
    'Solana'        AS address_type -- всі існуючі були Solana (обґрунтоване припущення)
FROM user_bundles
WHERE linked_wallets != '[]'::jsonb; -- пропускаємо юзерів без прив'язаних гаманців

-- Крок 2: Після перевірки що дані перенесені правильно — прибираємо стару колонку
-- (НЕ роби це одразу, спочатку протестуй!)
ALTER TABLE user_bundles DROP COLUMN linked_wallets;
