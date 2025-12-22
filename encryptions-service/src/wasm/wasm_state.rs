use std::{collections::HashMap, rc::Rc, str::FromStr, sync::Arc};

use async_lock::RwLock;
use solana_sdk::pubkey::Pubkey;
use wallet_models::domain::models::acc_data::Network;

use crate::{
    error_handling::error_code::{TokenError, WalletError},
    wasm::{
        models::TokenBalance,
        wasm_rpc_client::SolanaRpcProvider,
        wasm_token_acc_info::{TokenMetaDataProvider, get_valid_tokens},
    },
};

// #[cfg(target_arch = "wasm32")]
pub trait WalletSaturnManager {
    fn get_pubkey(&self) -> &Pubkey;
    fn get_network(&self) -> Network;
    fn get_display_name(&self) -> Option<&str>;

    fn refresh_balances(
        &self,
        provider: &dyn TokenMetaDataProvider,
    ) -> impl std::future::Future<Output = Result<(), WalletError>>;

    fn get_token_balance(
        &self,
        mint: &Pubkey,
    ) -> impl std::future::Future<Output = Option<TokenBalance>>;

    fn get_all_token_balances(&self) 
        -> impl std::future::Future<Output = Vec<TokenBalance>>;
}

// #[cfg(target_arch = "wasm32")]
pub struct WasmSaturnWalletState {
    pubkey: Pubkey,
    network: Network,
    display_name: Option<String>,
    token_balances: Arc<RwLock<HashMap<Pubkey, TokenBalance>>>,
    rpc_client: Rc<dyn SolanaRpcProvider>,
}

// #[cfg(target_arch = "wasm32")]
impl WasmSaturnWalletState {
    pub fn new(
        pubkey: Pubkey,
        network: Network,
        display_name: Option<String>,
        rpc_client: Rc<dyn SolanaRpcProvider>,
    ) -> Self {
        Self {
            pubkey,
            network,
            display_name,
            token_balances: Arc::new(RwLock::new(HashMap::new())),
            rpc_client,
        }
    }

    pub fn set_display_name(&mut self, name: Option<String>) {
        self.display_name = name;
    }
}

// #[cfg(target_arch = "wasm32")]
impl WalletSaturnManager for WasmSaturnWalletState {
    fn get_pubkey(&self) -> &Pubkey {
        &self.pubkey
    }

    fn get_network(&self) -> Network {
        self.network
    }

    fn get_display_name(&self) -> Option<&str> {
        self.display_name.as_deref()
    }

    async fn refresh_balances(
        &self,
        provider: &dyn TokenMetaDataProvider,
    ) -> Result<(), WalletError> {
        let new_balances = get_valid_tokens(self.rpc_client.as_ref(), &self.pubkey, provider)
            .await
            .map_err(|e| WalletError::Io(e.to_string()))?;

        let mut balances = self.token_balances.write().await;
        balances.clear();

        for balance in new_balances {
            let mint = Pubkey::from_str(&balance.mint).map_err(|_e| {
                WalletError::Token(TokenError::InvalidMintAddress {
                    address: balance.mint.clone(),
                })
            })?;
            balances.insert(mint, balance);
        }

        Ok(())
    }

    async fn get_token_balance(&self, mint: &Pubkey) -> Option<TokenBalance> {
        let balances = self.token_balances.read().await;
        balances.get(mint).cloned()
    }

    async fn get_all_token_balances(&self) -> Vec<TokenBalance> {
        let balances = self.token_balances.read().await;
        balances.values().cloned().collect()
    }
}
