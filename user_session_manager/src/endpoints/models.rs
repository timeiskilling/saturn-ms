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
    pub verify_data: VerifySignature, // Знову використовуємо базу! Уніфікація!

    pub target_wallet: String,
    pub wallet_id: String,
    pub name: String,
    pub address_type: String,
}
