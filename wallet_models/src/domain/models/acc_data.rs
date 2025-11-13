use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::domain::models::{token_models::TokenBalance, tx_models::TxSummary};

#[derive(Serialize, Deserialize)]
pub struct AccData {
    pub pubkey: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub network: Network, // "solana", "ethereum", "polygon", etc.
    // pub addresses: Vec<String>,       // derived addresses if any
    pub native_balance: String, // human readable
    pub native_raw: String,     // smallest unit
    pub tokens: Vec<TokenBalance>,
    pub transactions: Vec<TxSummary>,
    pub nonce: Option<u64>, // for EVM chains
    // pub is_watch_only: bool,
    // pub derived_path: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub last_synced_at: Option<DateTime<Utc>>,
    // client-only sensitive field (if you choose to store)
    // pub encrypted_seed: Option<String>, // KEEP CLIENT SIDE ONLY
}

impl Default for AccData {
    fn default() -> Self {
        Self {
            pubkey: Default::default(),
            display_name: Default::default(),
            avatar_url: Default::default(),
            network: Network::Solana,
            native_balance: Default::default(),
            native_raw: Default::default(),
            tokens: Default::default(),
            transactions: Default::default(),
            nonce: Default::default(),
            created_at: Default::default(),
            last_synced_at: Default::default(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub enum Network {
    Solana,
    Ethereum,
}

impl Network {
    pub fn native_token(&self) -> String {
        match self {
            Network::Solana => "SOL".to_string(),
            Network::Ethereum => "ETH".to_string(),
        }
    }
}
