use async_lock::RwLock;
use serde::{Deserialize, Serialize};
use solana_sdk::{pubkey::Pubkey, signature::Signature};
use std::{collections::HashMap, rc::Rc, sync::Arc, time::Duration};
use wallet_models::domain::models::{acc_data::Network, token_models::TokenBalance};
use zeroize::Zeroizing;

// #[cfg(target_arch = "wasm32")]
use web_time::Instant;

// #[cfg(not(target_arch = "wasm32"))]
// use tokio::time::Instant;
use zeroize::Zeroize;

use crate::{
    error_handling::error_code::{
        EncryptionError, KeystoreError, RpcError, TokenError, TransactionError, ValidationError,
        WalletError,
    },
    traits::signer_wraper::{SaturnSigner, SecureKeystore, SolanaKeypairSigner},
    wasm::{
        models::WalletCreationResult,
        wasm_encryptions::{
            CryptoError, CryptoVault, EncryptionParams, SecureString, create_encrypt_data, encrypt_seed_with_verification, keypair_from_seed
        },
        wasm_rpc_client::{SolanaRpcProvider, WasmRpcClient},
        wasm_solana_methods::create_unsign_transaction,
        wasm_state::{WalletSaturnManager, WasmSaturnWalletState},
        wasm_token_acc_info::TokenMetaDataProvider,
    },
};

pub struct WalletManager {
    rpc_provider: Rc<WasmRpcClient>,
    wallets: Rc<RwLock<HashMap<Pubkey, WalletEntry>>>,
    active_wallet: Arc<RwLock<Option<Pubkey>>>,
    config: WalletManagerConfig,
    metadata_provider: Arc<dyn TokenMetaDataProvider>,
}

pub struct WalletManagerConfig {
    default_keystore_timeout: Duration,
    default_encryption_params: EncryptionParams,
    default_network: Network,
}

impl Default for WalletManagerConfig {
    fn default() -> Self {
        Self {
            default_keystore_timeout: Duration::from_secs(360),
            default_encryption_params: EncryptionParams::default(),
            default_network: Network::Solana,
        }
    }
}

pub struct WalletEntry {
    crypto_vault: CryptoVault,
    wallet_state: WasmSaturnWalletState,
    keystore: Option<SecureKeystore<SolanaKeypairSigner>>,
    last_activity: Instant,
    keystore_timeout: Duration,
}

impl WalletManager {
    pub fn new<P>(
        rpc_provider: Rc<WasmRpcClient>,
        config: WalletManagerConfig,
        metadata_provider: P,
    ) -> Self
    where
        P: TokenMetaDataProvider + 'static,
    {
        Self {
            rpc_provider,
            wallets: Rc::new(RwLock::new(HashMap::new())),
            active_wallet: Arc::new(RwLock::new(None)),
            config,
            metadata_provider: Arc::new(metadata_provider),
        }
    }

    pub fn get_metadata_provider(&self) -> Arc<dyn TokenMetaDataProvider> {
        self.metadata_provider.clone()
    }
    pub async fn create_wallet(
        &self,
        password: SecureString,
        bip39_passphrase: Option<SecureString>,
        display_name: Option<String>,
        network: Option<Network>,
        keystore_timeout: Option<Duration>,
    ) -> Result<WalletCreationResult, WalletError> {
        let (encrypt_info, mnemonic) = create_encrypt_data(
            password,
            bip39_passphrase,
            self.config.default_encryption_params.clone(),
        )
        .map_err(|e| {
            WalletError::Encryption(EncryptionError::EncryptionFailed {
                reason: e.to_string(),
            })
        })?;

        let crypto_vault = CryptoVault::new(encrypt_info);

        let pubkey = *crypto_vault.pubkey();

        let wallet_network = network.unwrap_or(self.config.default_network);

        let wallet_state = WasmSaturnWalletState::new(
            pubkey,
            wallet_network,
            display_name,
            self.rpc_provider.clone(),
        );

        let timeout = keystore_timeout.unwrap_or(self.config.default_keystore_timeout);

        let entry = WalletEntry {
            crypto_vault,
            wallet_state,
            keystore: None,
            last_activity: Instant::now(),
            keystore_timeout: timeout,
        };

        let mut wallets = self.wallets.write().await;

        if wallets.contains_key(&pubkey) {
            return Err(WalletError::Validation(ValidationError::InvalidPublicKey {
                input: pubkey.to_string(),
            }));
        }

        wallets.insert(pubkey, entry);

        let mut active = self.active_wallet.write().await;
        if active.is_none() {
            *active = Some(pubkey);
        }

        tracing::info!(
            wallet = %pubkey,
            network = ?wallet_network,
            "New wallet created successfully"
        );

        let mnemonic_string = Zeroizing::new(mnemonic.to_string());
        let mnemonic_phrase = SecureString::new(mnemonic_string.to_string());

        Ok(WalletCreationResult {
            pubkey,
            mnemonic_phrase,
        })
    }

    pub async fn unclok_wallet(
        &self,
        pubkey: &Pubkey,
        password: SecureString,
    ) -> Result<(), WalletError> {
        let mut wallets = self.wallets.write().await;

        let entry = wallets.get_mut(pubkey).ok_or_else(|| {
            WalletError::Validation(ValidationError::WalletNotFound {
                pubkey: pubkey.to_string(),
            })
        })?;

        let is_valid = entry
            .crypto_vault
            .verify_password(&password)
            .await
            .map_err(|_| WalletError::Encryption(EncryptionError::InvalidPassword))?;

        if !is_valid {
            tracing::warn!(
                wallet = %pubkey,
                "Failed unlock attempt - invalid password"
            );
            return Err(WalletError::Keystore(KeystoreError::InvalidPassword));
        }

        let mut seed = entry
            .crypto_vault
            .decrypt_seed(password)
            .await
            .map_err(|e| match e {
                CryptoError::DecryptionFailed(_) => {
                    WalletError::Encryption(EncryptionError::DecryptionFailed {
                        reason: "Invalid password".to_string(),
                    })
                }
                _ => WalletError::Encryption(EncryptionError::DecryptionFailed {
                    reason: e.to_string(),
                }),
            })?;

        let keypair = keypair_from_seed(&seed).map_err(|_| {
            WalletError::Encryption(EncryptionError::InvalidSeedLength {
                expected: 32,
                got: 32,
            })
        })?;
        seed.zeroize();

        let signer = SolanaKeypairSigner::new(keypair);
        let mut keystore = SecureKeystore::new(entry.keystore_timeout);
        keystore.unlock_with_signer(signer);

        entry.keystore = Some(keystore);
        entry.last_activity = Instant::now();

        tracing::info!(
            wallet = %pubkey,
            timeout_secs = entry.keystore_timeout.as_secs(),
            "Wallet unlocked successfully"
        );

        Ok(())
    }

    pub async fn get_balance(
        &self,
        pubkey: &Pubkey,
        mint: &Pubkey,
    ) -> Result<Option<TokenBalance>, WalletError> {
        let wallets = self.wallets.read().await;

        let entry = wallets.get(pubkey).ok_or_else(|| {
            WalletError::Validation(ValidationError::WalletNotFound {
                pubkey: pubkey.to_string(),
            })
        })?;

        Ok(entry.wallet_state.get_token_balance(mint).await)
    }

    pub async fn refresh_balances(&self, pubkey: &Pubkey) -> Result<(), WalletError> {
        let wallets = self.wallets.read().await;

        let entry = wallets.get(pubkey).ok_or_else(|| {
            WalletError::Validation(ValidationError::WalletNotFound {
                pubkey: pubkey.to_string(),
            })
        })?;

        entry
            .wallet_state
            .refresh_balances(self.metadata_provider.as_ref())
            .await?;

        tracing::debug!(
            wallet = %pubkey,
            "Balances refreshed successfully"
        );

        Ok(())
    }

    pub async fn refresh_active_wallet_balances(&self) -> Result<(), WalletError> {
        let active = self.active_wallet.read().await;

        if let Some(pubkey) = *active {
            drop(active);
            self.refresh_balances(&pubkey).await
        } else {
            Err(WalletError::Validation(ValidationError::NoActiveWallet))
        }
    }

    pub async fn send_tokens(
        &self,
        from: &Pubkey,
        to: &Pubkey,
        amount: u64,
        mint: &Pubkey,
    ) -> Result<Signature, WalletError> {
        if amount == 0 {
            return Err(WalletError::Validation(ValidationError::InvalidAmount {
                value: amount.to_string(),
                reason: "Amount must be greater than zero".to_string(),
            }));
        }

        let mut wallets = self.wallets.write().await;

        let entry = wallets.get_mut(from).ok_or_else(|| {
            WalletError::Validation(ValidationError::WalletNotFound {
                pubkey: from.to_string(),
            })
        })?;

        let keystore = entry
            .keystore
            .as_ref()
            .ok_or(WalletError::Keystore(KeystoreError::Locked))?;

        if !keystore.is_unlocked() {
            return Err(WalletError::Keystore(KeystoreError::Locked));
        }

        entry.last_activity = Instant::now();

        let token_balance =
            entry
                .wallet_state
                .get_token_balance(mint)
                .await
                .ok_or(WalletError::Token(TokenError::TokenNotFound {
                    mint: mint.to_string(),
                }))?;

        let balance_amount = token_balance.amount.parse::<f64>().unwrap_or(0.0);

        if balance_amount < amount as f64 {
            return Err(WalletError::Validation(ValidationError::InvalidAmount {
                value: amount.to_string(),
                reason: format!(
                    "Insufficient balance. Available: {}, Required: {}",
                    balance_amount, amount
                ),
            }));
        }

        let blockhash = self
            .rpc_provider
            .get_latest_blockhash()
            .await
            .map_err(|e| {
                WalletError::Rpc(RpcError::ConnectionFailed {
                    endpoint: "blockchain".to_string(),
                    reason: e.to_string(),
                })
            })?;

        tracing::debug!(
            from = %from,
            to = %to,
            amount = amount,
            mint = %mint,
            blockhash = %blockhash,
            "Creating transaction"
        );

        let mut transaction =
            create_unsign_transaction(from, to, amount, &token_balance, blockhash).map_err(
                |e| {
                    WalletError::Transaction(TransactionError::CreationFailed {
                        reason: e.to_string(),
                    })
                },
            )?;

        let signature = keystore
            .with_signer(|signer| {
                let message = transaction.message_data();
                let sig = signer.sf_sign_message(&message);
                transaction.signatures = vec![sig];
                sig
            })
            .map_err(WalletError::Keystore)?;

        tracing::info!(
            from = %from,
            to = %to,
            amount = amount,
            mint = %mint,
            signature = %signature,
            "Transaction signed, sending to blockchain"
        );

        let final_signature = self
            .rpc_provider
            .send_transactions(&transaction)
            .await
            .map_err(|e| {
                WalletError::Transaction(TransactionError::SendFailed {
                    signature: Some(signature.to_string()),
                    reason: e.to_string(),
                })
            })?;

        let _ = entry
            .wallet_state
            .refresh_balances(self.metadata_provider.as_ref())
            .await;

        tracing::info!(
            from = %from,
            to = %to,
            amount = amount,
            mint = %mint,
            signature = %final_signature,
            "Transaction sent successfully"
        );

        Ok(final_signature)
    }

    pub async fn change_password(
        &self,
        pubkey: &Pubkey,
        old_password: SecureString,
        new_password: SecureString,
    ) -> Result<(), WalletError> {
        let mut wallets = self.wallets.write().await;

        let entry = wallets.get_mut(pubkey).ok_or_else(|| {
            WalletError::Validation(ValidationError::WalletNotFound {
                pubkey: pubkey.to_string(),
            })
        })?;

        {
            let keystore = entry
                .keystore
                .as_ref()
                .ok_or(WalletError::Keystore(KeystoreError::Locked))?;

            if !keystore.is_unlocked() {
                return Err(WalletError::Keystore(KeystoreError::Locked));
            }
        }

        let mut seed = entry
            .crypto_vault
            .decrypt_seed(old_password)
            .await
            .map_err(|_| WalletError::Encryption(EncryptionError::InvalidPassword))?;
        let encryption_params = entry.crypto_vault.encrypt_params().await;

        let new_encrypt = encrypt_seed_with_verification(&seed, new_password, encryption_params)
            .map_err(|e| {
                WalletError::Encryption(EncryptionError::EncryptionFailed {
                    reason: e.to_string(),
                })
            })?;

        seed.zeroize();

        entry.crypto_vault.change_encrypt(new_encrypt).await;

        entry.last_activity = Instant::now();

        tracing::info!(
            wallet = %pubkey,
            "Password changed successfully"
        );

        Ok(())
    }

    pub async fn set_active_wallet(&self, pubkey: Pubkey) -> Result<(), WalletError> {
        {
            let wallets = self.wallets.read().await;
            if !wallets.contains_key(&pubkey) {
                return Err(WalletError::Validation(ValidationError::WalletNotFound {
                    pubkey: pubkey.to_string(),
                }));
            }
        }

        let mut active = self.active_wallet.write().await;
        *active = Some(pubkey);

        tracing::info!(
            wallet = %pubkey,
            "Active wallet changed"
        );

        Ok(())
    }

    pub async fn get_active_wallet(&self) -> Option<WalletInfo> {
        let active_pubkey = {
            let active = self.active_wallet.read().await;
            *active
        }?;

        let wallets = self.wallets.read().await;

        wallets.get(&active_pubkey).map(|entry| {
        WalletInfo {
            pubkey: active_pubkey,
            display_name: entry.wallet_state.get_display_name().map(|s| s.to_string()),
            network: entry.wallet_state.get_network(),
            is_unlocked: entry
                .keystore
                .as_ref()
                .map(|ks| ks.is_unlocked())
                .unwrap_or(false),
        }
    })
    }

    pub async fn list_wallets(&self) -> Vec<WalletInfo> {
        let wallets = self.wallets.read().await;

        wallets
            .iter()
            .map(|(pubkey, entry)| WalletInfo {
                pubkey: *pubkey,
                display_name: entry.wallet_state.get_display_name().map(|s| s.to_string()),
                network: entry.wallet_state.get_network(),
                is_unlocked: entry
                    .keystore
                    .as_ref()
                    .map(|ks| ks.is_unlocked())
                    .unwrap_or(false),
            })
            .collect()
    }

    pub async fn cleanup_inactive_wallets(&self) {
        let mut wallets = self.wallets.write().await;
        let now = Instant::now();

        let mut locked_count = 0;

        for (pubkey, entry) in wallets.iter_mut() {
            if entry.keystore.is_some() {
                let elapsed = now.duration_since(entry.last_activity);

                if elapsed > entry.keystore_timeout {
                    entry.keystore = None;
                    locked_count += 1;

                    tracing::info!(
                        wallet = %pubkey,
                        inactive_for_secs = elapsed.as_secs(),
                        "Wallet locked due to inactivity"
                    );
                }
            }
        }

        if locked_count > 0 {
            tracing::debug!(locked_count = locked_count, "Cleanup completed");
        }
    }

    // pub fn start_cleanup_task(self: Arc<Self>) {
    //     tokio::spawn(async move {
    //         let mut interval = tokio::time::interval(Duration::from_secs(60));
    //         loop {
    //             interval.tick().await;
    //             self.cleanup_inactive_wallets().await;
    //         }
    //     });
    // }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletInfo {
    pub pubkey: Pubkey,
    pub display_name: Option<String>,
    pub network: Network,
    pub is_unlocked: bool,
}
