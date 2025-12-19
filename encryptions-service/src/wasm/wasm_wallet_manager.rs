// #![cfg(target_arch = "wasm32")]

use solana_sdk::pubkey::Pubkey;
use std::time::Duration;
use std::{str::FromStr};
use wallet_models::domain::models::acc_data::Network;
use wasm_bindgen::prelude::*;

use crate::wasm::models::*;
use crate::wasm::wasm_encryptions::SecureString;
use crate::wasm::wasm_wallet_service::WalletManager;

use async_lock::RwLock;

use crate::{
    error_handling::error_code::{KeystoreError, RpcError, ValidationError, WalletError},
};

#[wasm_bindgen(typescript_custom_section)]
const TS_INTERFACES: &'static str = r#"
export interface WalletBalance {
    amount: string;
    decimals: number;
    uiAmount: number | null;
}
"#;

#[wasm_bindgen]
pub struct WasmWalletManager {
    inner: RwLock<WalletManager>,
}

impl WasmWalletManager {
      pub fn new(manager : WalletManager) -> Self {
        Self { inner: RwLock::new(manager)}
    }
    
}

#[wasm_bindgen]
impl WasmWalletManager {
    #[wasm_bindgen(js_name = createWallet)]
    pub async fn create_wallet(&self, request_js: JsValue) -> Result<JsValue, JsValue> {
        let request: CreateWalletRequest = serde_wasm_bindgen::from_value(request_js)
            .map_err(|e| JsValue::from_str(&format!("Invalid request format: {}", e)))?;

        let password = SecureString::new(request.password);
        let secure_bip39 = request.bip39_passphrase.map(SecureString::from);
        let network = parse_network(request.network)?;
        let keystore_timeout = request.keystore_timeout_secs.map(Duration::from_secs);

        let manager = self.inner.write().await;

        let result = manager
            .create_wallet(
                password,
                secure_bip39,   
                request.display_name,
                network,
                keystore_timeout,
            )
            .await
            .map_err(|e| JsValue::from_str(&format!("Failed to create wallet: {}", e)))?;
        
        let js_result = JsWalletCreationResult {
            pubkey: result.pubkey.to_string(),
            recovery_phrase: result.mnemonic_phrase.as_str().to_string(),
        };
        
        let result_value = serde_wasm_bindgen::to_value(&js_result)
             .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;

        Ok(result_value)
    }

    #[wasm_bindgen(js_name = unlockWallet)]
    pub async fn unlock_wallet(
        &self,
        request_js: JsValue
    ) -> Result<JsValue, JsValue> {

        let request: UnlockWalletRequest = serde_wasm_bindgen::from_value(request_js)
            .map_err(|e| JsValue::from_str(&format!("Invalid request format: {}", e)))?;
              
        let secure_pass = request.get_secure_data()?;

        let manager = self.inner.read().await;

        manager
            .unclok_wallet(&secure_pass.pubkey, secure_pass.password)
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

        let manager = self.inner.write().await;

        let signature = manager
            .send_tokens(&from_pubkey, &to_pubkey, amount, &mint_pubkey)
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

    #[wasm_bindgen(js_name = getBalance)]
    pub async fn get_balance(&self, pubkey: String, mint: String) -> Result<JsValue, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?;

        let mint = Pubkey::from_str(&mint)
            .map_err(|e| JsValue::from_str(&format!("Invalid recipient address: {}", e)))?;

        let manager = self.inner.read().await;

        let balance = manager
            .get_balance(&pubkey, &mint)
            .await
            .map_err(|err| match err {
                WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                    JsValue::from_str(&format!("Wallet {} not found", pubkey))
                }
                e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
            })?;

        let result_js = serde_wasm_bindgen::to_value(&balance)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;

        Ok(result_js)
    }

    #[wasm_bindgen(js_name = refreshBalance)]
    pub async fn refresh_balances(&self, pubkey: String) -> Result<JsValue, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?;

        let manager = self.inner.read().await;

        manager
                .refresh_balances(&pubkey)
                .await
                .map_err(|err| match err {
                    WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                        JsValue::from_str(&format!("Wallet {} not found", pubkey))
                    }
                    e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
                })?;
                
        Ok(JsValue::from_bool(true))
    }

    #[wasm_bindgen(js_name = refreshActiveWalletBalance)]
    pub async fn refresh_active_wallet_balances(&self) -> Result<JsValue, JsValue> {
        let manager = self.inner.read().await;

        manager
                .refresh_active_wallet_balances()
                .await
                .map_err(|err| match err {
                    WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                        JsValue::from_str(&format!("Wallet {} not found", pubkey))
                    }
                    e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
                })?;
                
        Ok(JsValue::TRUE)
    }

    #[wasm_bindgen(js_name = changePassword)]
    pub async fn change_password(
        &self,
        pubkey_str: String,
        old_password: String,
        new_password: String,
    ) -> Result<JsValue, JsValue> {

        let pubkey = Pubkey::from_str(&pubkey_str)
            .map_err(|e| JsValue::from_str(&format!("Invalid pubkey: {}", e)))?;

        let old_secure = SecureString::from(old_password);
        let new_secure = SecureString::from(new_password);

        let manager = self.inner.read().await;

        manager.change_password(&pubkey, old_secure, new_secure)
            .await
            .map_err(|e| JsValue::from_str(&format!("Change password failed: {:?}", e)))?;

        Ok(JsValue::TRUE)
    }

    #[wasm_bindgen(js_name = setActiveWallet)]
    pub async fn set_active_wallet(&self, pubkey_str: String) -> Result<JsValue, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey_str)
            .map_err(|e| JsValue::from_str(&format!("Invalid pubkey: {}", e)))?;

        let manager = self.inner.read().await;

        manager.set_active_wallet(pubkey)
            .await
            .map_err(|e| JsValue::from_str(&format!("Failed to set active wallet: {:?}", e)))?;

        Ok(JsValue::TRUE)
    }

    #[wasm_bindgen(js_name = getActiveWallet)]
    pub async fn get_active_wallet(&self) -> Result<JsValue, JsValue> {
        let manager = self.inner.read().await;

        let wallet_info = manager.get_active_wallet().await;

        serde_wasm_bindgen::to_value(&wallet_info)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    #[wasm_bindgen(js_name = listWallets)]
    pub async fn list_wallets(&self) -> Result<JsValue, JsValue> {
        let manager = self.inner.read().await;

        let wallets = manager.list_wallets().await;

        let js_value = serde_wasm_bindgen::to_value(&wallets)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;

        Ok(js_value)
    }

    #[wasm_bindgen(js_name = cleanupInactiveWallets)]
    pub async fn cleanup_inactive_wallets(&self) -> Result<(), JsValue> {
        let manager = self.inner.read().await;
        manager.cleanup_inactive_wallets().await;
        Ok(())
    }
}


fn parse_network(network_str: Option<String>) -> Result<Option<Network>, JsValue> {
    network_str
        .map(|s| {
            Network::from_str(&s).map_err(|_| {
                JsValue::from_str(&format!(
                    "Invalid network '{}'. Expected: 'mainnet', 'devnet', or 'testnet'",
                    s
                ))
            })
        })
        .transpose()
}