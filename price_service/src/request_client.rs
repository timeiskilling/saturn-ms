use bundle_status_service::{
    prelude::RetryConfig,
    reqwest_client::{HttpManager, JupiterProvider},
};
use config::load;
use dashmap::DashMap;
use std::{hash::RandomState, sync::Arc};

struct TokensForFetch {
    client: Arc<dyn JupiterProvider>,
    token_data: DashMap<String, Token, RandomState>,
}

impl TokensForFetch {
    pub fn new() -> Self {
        let config = load();

        let client = Arc::new(HttpManager::new(
            "https://api.jup.ag/tokens/v2".to_string(),
            50,
            RetryConfig::default(),
            None,
            &config.jupiter_api_key,
        ));

        Self {
            client,
            token_data: DashMap::new(),
        }
    }
}

struct Token {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub icon: String,
    pub decimals: i64,
    pub circ_supply: f64,
    pub total_supply: f64,
    pub token_program: String,
}

