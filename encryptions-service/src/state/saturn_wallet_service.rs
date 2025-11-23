use std::{sync::Arc, time::Duration};

use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{pubkey::Pubkey, signature::Signature};
use tokio::sync::Mutex;
use wallet_models::domain::models::{acc_data::Network, token_models::TokenBalance};
use zeroize::Zeroize;

use crate::{
    ednpoints::token_acc_info::TokenMetaDataProvider, error_handling::error_code::*, password_encryptions::{
        encryption_parms::EncryptionParams,
        impl_encryptions::{
            CryptoError,create_encrypt_data, encrypt_seed_with_verification,
            keypair_from_seed,
        },
        secure_string::SecureString,
    }, rpc_layer::rpc_provider::SolanaRpcProvider, state::{
        crypto_vault::CryptoVault,
        encrypted_state::{SaturnWalletState, WalletSaturnManager},
    }, traits::signer_wraper::{KeyStoreManager, SaturnSigner, SecureKeystore, SolanaKeypairSigner}, transactions::tokens_transactions::create_unsign_transaction
};

pub struct SaturnWalletService<W>
where
    W: WalletSaturnManager,
{
    crypto_vault: Arc<CryptoVault>,
    keystore: Arc<Mutex<SecureKeystore<SolanaKeypairSigner>>>,
    wallet_state: Arc<W>,
    rpc_client: Arc<dyn SolanaRpcProvider>,
}

impl<W> SaturnWalletService<W>
where
    W: WalletSaturnManager,
{
    pub fn new(
        crypto_vault: CryptoVault,
        keystore_timeout: Duration,
        wallet_state: W,
        rpc_client: Arc<dyn SolanaRpcProvider>,
    ) -> Self {
        let keystore = SecureKeystore::new(keystore_timeout);

        Self {
            crypto_vault: Arc::new(crypto_vault),
            keystore: Arc::new(Mutex::new(keystore)),
            wallet_state: Arc::new(wallet_state),
            rpc_client,
        }
    }

    // pub fn create_wallet(
    //     password: SecureString,
    //     bip39_passphrase: Option<SecureString>,
    //     encryption_params: EncryptionParams,
    //     network: Network,
    //     display_name: Option<String>,
    //     keystore_timeout: Duration,
    //     rpc_client: Arc<RpcClient>,
    // ) -> Result<Self, CryptoError>
    // {
    //     let encrypt_info = create_encrypt_data(
    //         password,
    //         bip39_passphrase,
    //         encryption_params,
    //     )?;

    //     let crypto_vault = CryptoVault::new(encrypt_info);
    //     let pubkey = *crypto_vault.pubkey();

    //     let wallet_state = SaturnWalletState::new(
    //         pubkey,
    //         network,
    //         display_name,
    //         rpc_client.clone(),
    //     );

    //     Ok(Self::new(
    //         crypto_vault,
    //         keystore_timeout,
    //         wallet_state,
    //         rpc_client,
    //     ))
    // }

    pub async fn get_balance(&self, mint: &Pubkey) -> Option<TokenBalance> {
        self.wallet_state.get_token_balance(mint).await
    }

    pub async fn refresh_balances<P>(&self, provider: &P) -> Result<(), WalletError>
    where
        P: TokenMetaDataProvider,
    {
        self.wallet_state.refresh_balances(provider).await
    }

    pub async fn send_tokens<P>(
        &self,
        to: &Pubkey,
        amount: u64,
        mint: &Pubkey,
        provider: &P,
    ) -> Result<Signature, WalletError>
    where
        P: TokenMetaDataProvider,
    {
        if amount == 0 {
            return Err(WalletError::Validation(ValidationError::InvalidAmount {
                value: amount.to_string(),
                reason: "Amount must be greater than zero".to_string(),
            }));
        }

        let token_balance =
            self.wallet_state
                .get_token_balance(mint)
                .await
                .ok_or(WalletError::Token(TokenError::TokenNotFound {
                    mint: mint.to_string(),
                }))?;

        let blockhash = self.rpc_client.get_latest_blockhash().await.map_err(|e| {
            WalletError::Rpc(RpcError::ConnectionFailed {
                endpoint: "default".to_string(),
                reason: e.to_string(),
            })
        })?;

        let mut transaction = create_unsign_transaction(
            self.wallet_state.get_pubkey(),
            to,
            amount,
            &token_balance,
            blockhash,
        )
        .map_err(|e| {
            WalletError::Transaction(TransactionError::CreationFailed {
                reason: e.to_string(),
            })
        })?;

        let signature = {
            let keystore = self.keystore.lock().await;

            keystore
                .with_signer(|signer| {
                    let message = transaction.message_data();
                    let sig = signer.sf_sign_message(&message);
                    transaction.signatures = vec![sig];
                    sig
                })
                .map_err(WalletError::Keystore)?
        };

        let final_signature = self
            .rpc_client
            .send_transactions(&transaction)
            .await
            .map_err(|e| {
                WalletError::Transaction(TransactionError::SendFailed {
                    signature: Some(signature.to_string()),
                    reason: e.to_string(),
                })
            })?;

        let _ = self.wallet_state.refresh_balances(provider).await;

        Ok(final_signature)
    }

    pub async fn unclock(&self, password: SecureString) -> Result<(), WalletError> {
        let is_valid = self
            .crypto_vault
            .verify_password(&password).await
            .map_err(|_| WalletError::Encryption(EncryptionError::InvalidPassword))?;

        if !is_valid {
            return Err(WalletError::Keystore(KeystoreError::InvalidPassword));
        }

        let mut seed = self
            .crypto_vault
            .decrypt_seed(password).await
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

        let keypair = keypair_from_seed(&seed).map_err(|e| {
            WalletError::Encryption(EncryptionError::InvalidSeedLength {
                expected: 32,
                got: 32,
            })
        })?;

        seed.zeroize();
        let signer = SolanaKeypairSigner::new(keypair);
        let mut keystore = self.keystore.lock().await;
        keystore.unlock_with_signer(signer);

        Ok(())
    }

    pub async fn lock(&self) {
        let mut keystore = self.keystore.lock().await;
        keystore.lock();
    }

    pub async fn is_unlocked(&self) -> bool {
        let keystore = self.keystore.lock().await;
        keystore.is_unlocked()
    }

    pub async fn remaining_unlock_time(&self) -> Option<Duration> {
        let keystore = self.keystore.lock().await;
        keystore.get_remaining_time()
    }

    pub async fn change_password(
        &self,
        old_password: SecureString,
        new_password: SecureString,
    ) -> Result<(), WalletError> {
        {
            let keystore = self.keystore.lock().await;
            if !keystore.is_unlocked() {
                return Err(WalletError::Keystore(KeystoreError::Locked));
            }
        }

        let mut seed = self
            .crypto_vault
            .decrypt_seed(old_password).await
            .map_err(|_| WalletError::Encryption(EncryptionError::InvalidPassword))?;

        let new_encrypt =
            encrypt_seed_with_verification(&seed, new_password, self.crypto_vault.encrypt_params().await)
                .map_err(|e| {
                    WalletError::Encryption(EncryptionError::EncryptionFailed {
                        reason: e.to_string(),
                    })
                })?;
                
        seed.zeroize();

        self.crypto_vault.change_encrypt(new_encrypt).await;
        Ok(())
    }
}

impl SaturnWalletService<SaturnWalletState> {
    pub fn create_wallet(
        password: SecureString,
        bip39_passphrase: Option<SecureString>,
        encryption_params: EncryptionParams,
        network: Network,
        display_name: Option<String>,
        keystore_timeout: Duration,
        rpc_client: Arc<dyn SolanaRpcProvider>,
    ) -> Result<Self, CryptoError> // Self == SaturnWalletService<SaturnWalletState>
    {
        let encrypt_info = create_encrypt_data(password, bip39_passphrase, encryption_params)?;

        let crypto_vault = CryptoVault::new(encrypt_info);
        let pubkey = *crypto_vault.pubkey();

        let wallet_state =
            SaturnWalletState::new(pubkey, network, display_name, rpc_client.clone());

        Ok(Self::new(
            crypto_vault,
            keystore_timeout,
            wallet_state,
            rpc_client,
        ))
    }
}
