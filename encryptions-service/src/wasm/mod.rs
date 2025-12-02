use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;
use std::{str::FromStr, sync::Arc};
use wasm_bindgen::prelude::*;

use crate::{
    ednpoints::token_acc_info::JupiterClient, error_handling::error_code::{KeystoreError, RpcError, ValidationError, WalletError}, password_encryptions::secure_string::SecureString, state::saturn_wallet_service::WalletManager
};

#[wasm_bindgen]
pub struct WasmWalletManager {
    inner: Arc<tokio::sync::RwLock<WalletManager>>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateWalletRequest {
    password: String,
    display_name: Option<String>,
    network: Option<String>,
}

#[derive(Deserialize)]
pub struct SendTokensRequest {
    from: String,
    to: String,
    amount: String,
    mint: String,
}

#[derive(Serialize, Deserialize)]
pub struct WalletInfoJs {
    pubkey: String,
    display_name: Option<String>,
    network: String,
    is_unlocked: bool,
}

#[wasm_bindgen]
impl WasmWalletManager {
    #[wasm_bindgen(js_name = unlockWallet)]
    pub async fn unlock_wallet(
        &self,
        pubkey: String,
        password: String,
    ) -> Result<JsValue, JsValue> {
        let secure_pass = SecureString::new(password);

        let pubkey = Pubkey::from_str(&pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid pubkey format: {}", e)))?;

        let manager = self.inner.read().await;

        manager
            .unclok_wallet(&pubkey, secure_pass)
            .await
            .map_err(|e| JsValue::from_str(&format!("Failed to unlock wallet: {}", e)))?;

        Ok(JsValue::from_bool(true))
    }

    #[wasm_bindgen(js_name = sendTokens)]
    pub async fn send_tokens(&self, request_js: JsValue) -> Result<JsValue, JsValue> {
        let request: SendTokensRequest = serde_wasm_bindgen::from_value(request_js)
            .map_err(|e| JsValue::from_str(&format!("Invalid request format: {}", e)))?;

        let from_pubkey = Pubkey::from_str(&request.from)
            .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?;

        let to_pubkey = Pubkey::from_str(&request.to)
            .map_err(|e| JsValue::from_str(&format!("Invalid recipient address: {}", e)))?;

        let mint_pubkey = Pubkey::from_str(&request.mint)
            .map_err(|e| JsValue::from_str(&format!("Invalid token address: {}", e)))?;

        let amount = request
            .amount
            .parse::<u64>()
            .map_err(|e| JsValue::from_str(&format!("Invalid amount: {}", e)))?;

        let provider = JupiterClient::new("https://api.jup.ag")
            .map_err(|e| JsValue::from_str(&format!("Invalid provider: {}", e)))?;

        let manager = self.inner.write().await;

        let signature = manager
            .send_tokens(&from_pubkey, &to_pubkey, amount, &mint_pubkey, &provider)
            .await
            .map_err(|e| match e {
                WalletError::Keystore(KeystoreError::Locked) => {
                    JsValue::from_str("Wallet is locked. Please unlock it first.")
                }
                WalletError::Validation(ValidationError::InvalidAmount { reason, .. }) => {
                    JsValue::from_str(&format!("Invalid amount: {}", reason))
                }
                WalletError::Rpc(RpcError::ConnectionFailed { reason, .. }) => {
                    JsValue::from_str(&format!("Network error: {}", reason))
                }
                _ => JsValue::from_str(&format!("Transaction failed: {}", e)),
            })?;

        let signature_str = signature.to_string();
        Ok(JsValue::from_str(&signature_str))
    }
}
