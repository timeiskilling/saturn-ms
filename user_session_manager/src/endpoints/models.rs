use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct NonceResponse {
    pub nonce: String,
    pub request_id: String,
    pub message_template: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TargetPayload {
    pub target_wallet: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifySignature {
    pub request_id: String,
    pub public_key: String,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolVerifyRequest {
    #[serde(flatten)]
    pub verify_data: VerifySignature,
    #[serde(default)]
    pub wallet_id: String,
    #[serde(default)]
    pub address_type: String,
    #[serde(default)]
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PromoteWalletRequest {
    #[serde(flatten)]
    pub verify_data: VerifySignature,
    pub target_wallet: String,
    pub wallet_id: String,
    pub name: String,
    pub address_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryTransactionRequest {
    pub tx_signature: String,
    pub signer: String,
    pub receiver: String,
    pub input_mint: String,
    pub output_mint: String,
    pub amount: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::prelude::FromRow)]
pub struct TransactionHistoryRecord {
    pub id: i64,
    pub signer: String,
    pub tx_signature: String,
    pub owner_wallet: String,
    pub receiver: String,
    pub input_mint: String,
    pub output_mint: String,
    pub amount: String,
    pub transaction_date: DateTime<Utc>,
}
