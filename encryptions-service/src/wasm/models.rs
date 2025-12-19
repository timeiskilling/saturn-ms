use std::str::FromStr;

use crate::wasm::wasm_encryptions::SecureString;
use serde::{Deserialize, Serialize};
use serde_json::to_string;
use solana_sdk::pubkey::Pubkey;
use tsify::Tsify;
use wasm_bindgen::{JsValue};

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

#[derive(Deserialize)]
pub struct UnlockWalletRequest {
    pub pubkey: String,
    password: String,
}

pub struct SecureWalletData {
    pub pubkey: Pubkey,
    pub password: SecureString,
}

impl UnlockWalletRequest {
    pub fn get_secure_data(self) -> Result<SecureWalletData, JsValue> {
        Ok(SecureWalletData {
            pubkey: Pubkey::from_str(&self.pubkey)
                .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?,
            password: SecureString::new(self.password),
        })
    }
}

#[derive(Serialize, Deserialize)]
pub struct WalletInfoJs {
    pub pubkey: String,
    pub display_name: Option<String>,
    pub network: String,
    pub is_unlocked: bool,
}

pub struct WalletCreationResult {
    pub pubkey: Pubkey,
    pub mnemonic_phrase: SecureString,
}

#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi)]
pub struct JsWalletCreationResult {
    pub pubkey: String,
    pub recovery_phrase: String,
}
