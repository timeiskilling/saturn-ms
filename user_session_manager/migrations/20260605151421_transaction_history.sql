-- Add migration script here
CREATE TABLE IF NOT EXISTS transaction_history (
    id BIGSERIAL PRIMARY KEY,
    signer VARCHAR(64) NOT NULL,
    tx_signature VARCHAR(150) UNIQUE,
    owner_wallet VARCHAR(64) NOT NULL,
    receiver VARCHAR(64) NOT NULL,
    input_mint VARCHAR(64) NOT NULL,
    output_mint VARCHAR(64) NOT NULL,
    amount VARCHAR(64) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_history_receiver
ON transaction_history(receiver);

CREATE INDEX IF NOT EXISTS idx_transaction_history_owner ON transaction_history(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_transaction_history_owner_date ON transaction_history(owner_wallet, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_history_date
ON transaction_history(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_history_receiver_date
ON transaction_history(receiver, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_history_signed
ON transaction_history(signer);

CREATE INDEX IF NOT EXISTS idx_transaction_history_signed_date
ON transaction_history(signer, transaction_date DESC);
