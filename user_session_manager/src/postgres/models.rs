use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveBundlesPayload {
    pub bundles: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LinkedWalletResponse {
    pub status: String,
    pub primary_wallet: String,
    pub linked_wallet: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnlinkedWalletResponse {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PromoteWalletResponse {
    pub status: String,
    pub new_primary: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteAccountResponse {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnlinkWalletResponse {
    pub status: String,
}
