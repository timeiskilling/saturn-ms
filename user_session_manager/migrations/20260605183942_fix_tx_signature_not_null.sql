-- Add migration script here
ALTER TABLE transaction_history
ALTER COLUMN tx_signature SET NOT NULL;
