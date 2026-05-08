use std::{
    fmt::Display,
    sync::{Arc, atomic::AtomicU64},
};

use axum::{Router, routing::get};
use bundle_status_service::reqwest_client::JupiterProvider;
use common::models::TokenInfo;
use saturn_errors::error::SaturnTransactionsServiceError;
use tokio::sync::RwLock;

use crate::handlers::token_list_handler;

pub struct AppState {
    pub cached_tokens: Arc<RwLock<Vec<TokenInfo>>>,
    // pub token_map: Arc<RwLock<HashMap<String, TokenInfo>>>,
    _version: AtomicU64,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            cached_tokens: Arc::new(RwLock::new(Vec::new())),
            // token_map: Arc::new(RwLock::new(HashMap::new())),
            _version: AtomicU64::new(1),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

pub enum Query {
    Lst,
    Verified,
}

impl Display for Query {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Query::Lst => write!(f, "lst"),
            Query::Verified => write!(f, "verified"),
        }
    }
}

pub async fn setup_tokens(
    query: Query,
    binance_url: &str,
    http_client: Arc<dyn JupiterProvider>,
) -> Result<Vec<TokenInfo>, SaturnTransactionsServiceError> {
    let query_str = query.to_string();

    let token_list = http_client
        .get_list_of_tokens(&query_str, binance_url)
        .await?;

    Ok(token_list)
}

pub async fn build_ws_url(state: Arc<AppState>) -> Result<String, SaturnTransactionsServiceError> {
    let cached_tokens = state.cached_tokens.read().await;

    let filtered_streams: Vec<String> = cached_tokens
        .iter()
        .map(|symbol| format!("{}usdt@ticker", symbol.symbol.to_lowercase()))
        .collect();

    tracing::info!("Created {} filtered streams", filtered_streams.len());

    let ws_url = format!(
        "wss://stream.binance.com:9443/stream?streams={}",
        filtered_streams.join("/")
    );

    Ok(ws_url)
}

pub fn spawn_token_poller(
    binance_url: String,
    http_client: Arc<dyn JupiterProvider>,
    state: Arc<AppState>,
) {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_hours(2));

        interval.tick().await;

        loop {
            interval.tick().await;
            tracing::info!("Refetching tokens from Jupiter...");

            match setup_tokens(Query::Verified, &binance_url, http_client.clone()).await {
                Ok(new_tokens) => {
                    let mut cached = state.cached_tokens.write().await;
                    *cached = new_tokens;
                    tracing::info!(
                        "Successfully updated token cache with {} tokens",
                        cached.len()
                    );
                }
                Err(e) => {
                    tracing::error!("Failed to refetch tokens: {}", e);
                }
            }
        }
    });
}

pub async fn build_router(
    binance_url: String,
    http_client: Arc<dyn JupiterProvider>,
    state: Arc<AppState>,
) -> Result<Router, SaturnTransactionsServiceError> {
    let initial_tokens = setup_tokens(Query::Verified, &binance_url, http_client).await?;

    // let token_map: HashMap<String, TokenInfo> = initial_tokens
    //     .iter()
    //     .map(|t| (t.symbol.clone(), t.clone()))
    //     .collect();

    state.cached_tokens.write().await.extend(initial_tokens);
    // state.token_map.write().await.extend(token_map);

    let cors_layer = tower::ServiceBuilder::new().layer(
        tower_http::cors::CorsLayer::new()
            .allow_origin(tower_http::cors::Any)
            .allow_headers(tower_http::cors::Any)
            .allow_methods(tower_http::cors::Any),
    );

    let app = Router::new()
        .route("/get/list_of_tokens", get(token_list_handler))
        .layer(cors_layer)
        .with_state(state);

    Ok(app)
}
