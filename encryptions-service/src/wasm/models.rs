use crate::error_handling::error_code::EncryptionError;
// #![cfg(target_arch = "wasm32")]
use crate::error_handling::error_code::WalletError;
use crate::wasm::wasm_encryptions::EncryptedData;
use crate::wasm::wasm_encryptions::SecureString;
use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;
use wallet_models::domain::models::acc_data::Network;
use std::str::FromStr;
use tsify::Tsify;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
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

#[derive(Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct SendTokensRequest {
    pub from: String,
    pub to: String,
    pub amount: String,
    pub mint: String,
}

#[derive(Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
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

#[derive(Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct JsWalletCreationResult {
    pub pubkey: String,
    pub recovery_phrase: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct TokenBalance {
    pub mint: String,
    pub symbol: String,
    pub amount: String,
    pub raw: String,
    pub decimals: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usd_price: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token_program: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct WalletInfo {
    pub pubkey: Pubkey,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    pub network: Network,
    pub is_unlocked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsWalletInfo {
    pub pubkey: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    pub network: String,
    pub is_unlocked: bool,
}

pub trait LockResultExt<T> {
    fn or_busy(self, method_name: &str) -> Result<T, WalletError>;
}

impl<T> LockResultExt<T> for Option<T> {
    fn or_busy(self, method_name: &str) -> Result<T, WalletError> {
        self.ok_or_else(|| WalletError::BlockedWalletManager {
            issue: "Wallet manager is busy".to_string(),
            method: method_name.to_string(),
        })
    }
}

#[wasm_bindgen]
pub struct RestoreWalletRequest {
    encrypted_data: String,
    password: String,
    name : String,
    network : String
}

#[wasm_bindgen]
impl RestoreWalletRequest {
    #[wasm_bindgen(constructor)]
    pub fn new(encrypted_data: String, password: String, name : String,network : String) -> Self {
        Self {encrypted_data,password,name, network }
    }
}

impl RestoreWalletRequest {
    pub(crate) fn get_data(&self) -> Result<(EncryptedData, SecureString,Network,String), WalletError> {
        let encrypted: EncryptedData = serde_json::from_str(&self.encrypted_data).map_err(|e| {
            WalletError::Encryption(EncryptionError::DecryptionFailed {
                reason: "invalid json parsing".to_string(),
            })
        })?;

        let password = SecureString::from(self.password.as_str());

        let network = Network::from_str(&self.network).map_err(|e|{
            WalletError::Io("Invalid Network".to_string())
        })?;

        let name = self.name.clone();
        Ok((encrypted, password,network,name))
    }
}
