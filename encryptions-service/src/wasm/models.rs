use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateWalletRequest {
    pub password: String,
    #[serde(default)]
    pub bip39_passphrase: Option<String>,
    #[serde(default)]
    pub display_name: Option<String>,
    #[serde(default)]
    pub network: Option<String>,
    #[serde(default)]
    pub keystore_timeout_secs: Option<u64>,
}

#[derive(Deserialize)]
pub struct SendTokensRequest {
    pub from: String,
    pub to: String,
    pub amount: String,
    pub mint: String,
}

#[derive(Serialize, Deserialize)]
pub struct WalletInfoJs {
    pub pubkey: String,
    pub display_name: Option<String>,
    pub network: String,
    pub is_unlocked: bool,
}
