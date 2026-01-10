#![cfg(target_arch = "wasm32")]

use async_lock::RwLock;
use solana_sdk::pubkey::Pubkey;
use std::rc::Rc;
use std::str::FromStr;
use std::time::Duration;
use wallet_models::domain::models::acc_data::Network;
use wasm_bindgen::prelude::*;

use crate::wasm::wasm_encryptions::SecureString;
use crate::wasm::wasm_wallet_service::WalletManager;
use crate::wasm::{models::*};

use crate::error_handling::error_code::{KeystoreError, RpcError, ValidationError, WalletError};

#[wasm_bindgen]
pub struct WasmWalletManager {
    inner: Rc<RwLock<WalletManager>>,
}

impl WasmWalletManager {
    pub fn new(manager: WalletManager) -> Self {
        Self {
            inner: Rc::new(RwLock::new(manager)),
        }
    }
}

#[wasm_bindgen]
impl WasmWalletManager {
    #[wasm_bindgen(js_name = createWallet)]
    pub fn create_wallet(
        &self,
        request: CreateWalletRequest,
    ) -> Result<JsWalletCreationResult, JsValue> {
        let password = SecureString::new(request.password);
        let secure_bip39 = request.bip39_passphrase.map(SecureString::from);
        let network = parse_network(request.network)?;
        let keystore_timeout = request.keystore_timeout_secs.map(Duration::from_secs);

        let manager = self
            .inner
            .try_write()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        let result = manager
            .create_wallet(
                password,
                secure_bip39,
                request.display_name,
                network,
                keystore_timeout,
            )
            .map_err(|e| JsValue::from_str(&format!("Failed to create wallet: {}", e)))?;

        let js_result = JsWalletCreationResult {
            pubkey: result.pubkey.to_string(),
            recovery_phrase: result.mnemonic_phrase.as_str().to_string(),
        };

        Ok(js_result)
    }

    #[wasm_bindgen(js_name = unlockWallet)]
    pub fn unlock_wallet(&self, request: UnlockWalletRequest) -> Result<bool, JsValue> {
        let secure_pass = request.get_secure_data()?;

        let manager = self
            .inner
            .try_write()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        manager
            .unlock_wallet(&secure_pass.pubkey, secure_pass.password)
            .map_err(|e| JsValue::from_str(&format!("Failed to unlock wallet: {}", e)))?;

        Ok(true)
    }

    #[wasm_bindgen(js_name = sendTokens)]
    pub async fn send_tokens(&self, request: SendTokensRequest) -> Result<String, JsValue> {
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

        Ok(signature.to_string())
    }

    #[wasm_bindgen(js_name = getBalance)]
    pub fn get_balance(
        &self,
        pubkey: String,
        mint: String,
    ) -> Result<Option<TokenBalance>, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?;

        let mint = Pubkey::from_str(&mint)
            .map_err(|e| JsValue::from_str(&format!("Invalid recipient address: {}", e)))?;

        let manager = self
            .inner
            .try_read()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        let balance = manager
            .get_balance(&pubkey, &mint)
            .map_err(|err| match err {
                WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                    JsValue::from_str(&format!("Wallet {} not found", pubkey))
                }
                e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
            })?;

        Ok(balance)
    }

    #[wasm_bindgen(js_name = refreshBalance)]
    pub async fn refresh_balances(&self, pubkey: String) -> Result<Vec<TokenBalance>, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey)
            .map_err(|e| JsValue::from_str(&format!("Invalid sender address: {}", e)))?;

        let manager = self.inner.write().await;

        let balance = manager
            .refresh_balances(&pubkey)
            .await
            .map_err(|err| match err {
                WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                    JsValue::from_str(&format!("Wallet {} not found", pubkey))
                }
                e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
            })?;

        Ok(balance)
    }

    #[wasm_bindgen(js_name = refreshActiveWalletBalance)]
    pub async fn refresh_active_wallet_balances(&self) -> Result<Vec<TokenBalance>, JsValue> {
        let manager = self.inner.write().await;

        let balance = manager
            .refresh_active_wallet_balances()
            .await
            .map_err(|err| match err {
                WalletError::Validation(ValidationError::WalletNotFound { pubkey }) => {
                    JsValue::from_str(&format!("Wallet {} not found", pubkey))
                }
                e => JsValue::from_str(&format!("Failed to fetch balance: {:?}", e)),
            })?;

        Ok(balance)
    }

    #[wasm_bindgen(js_name = changePassword)]
    pub fn change_password(
        &self,
        pubkey_str: String,
        old_password: String,
        new_password: String,
    ) -> Result<bool, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey_str)
            .map_err(|e| JsValue::from_str(&format!("Invalid pubkey: {}", e)))?;

        let old_secure = SecureString::from(old_password);
        let new_secure = SecureString::from(new_password);

        let manager = self
            .inner
            .try_write()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        manager
            .change_password(&pubkey, old_secure, new_secure)
            .map_err(|e| JsValue::from_str(&format!("Change password failed: {:?}", e)))?;

        Ok(true)
    }

    #[wasm_bindgen(js_name = setActiveWallet)]
    pub fn set_active_wallet(&self, pubkey_str: String) -> Result<bool, JsValue> {
        let pubkey = Pubkey::from_str(&pubkey_str)
            .map_err(|e| JsValue::from_str(&format!("Invalid pubkey: {}", e)))?;

        let manager = self
            .inner
            .try_write()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        manager
            .set_active_wallet(pubkey)
            .map_err(|e| JsValue::from_str(&format!("Failed to set active wallet: {:?}", e)))?;

        Ok(true)
    }

    #[wasm_bindgen(js_name = getActiveWallet)]
    pub fn get_active_wallet(&self) -> Result<Option<WalletInfo>, JsValue> {
        let manager = self
            .inner
            .try_read()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        let wallet_info = manager.get_active_wallet();

        Ok(wallet_info)
    }

    #[wasm_bindgen(js_name = listWallets)]
    pub fn list_wallets(&self) -> Result<Vec<WalletInfo>, JsValue> {
        let manager = self
            .inner
            .try_read()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;

        let wallets = manager.list_wallets();

        Ok(wallets)
    }

    #[wasm_bindgen(js_name = cleanupInactiveWallets)]
    pub fn cleanup_inactive_wallets(&self) -> Result<(), JsValue> {
        let manager = self
            .inner
            .try_write()
            .ok_or_else(|| JsValue::from_str("Wallet manager is busy"))?;
        manager.cleanup_inactive_wallets();
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
