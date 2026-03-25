use std::sync::Arc;

use axum::Router;
use bundle_status_service::{prelude::RetryConfig, reqwest_client::HttpManager};
use config::load;
use saturn_errors::error::SaturnTransactionsServiceError;
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{
    build::{AppState, build_router, build_ws_url},
    redis_interface::connection::redis_conn,
    ws_listener::run_binance_ws_client,
};

pub mod api_extracter;
pub mod build;
pub mod deserialization;
pub mod handlers;
pub mod models;
pub mod redis_interface;
pub mod ws_listener;

#[tokio::main]
async fn main() -> Result<(), SaturnTransactionsServiceError> {
    let config = load();
    let exchange_binance_url = "https://api.binance.com/api/v3/exchangeInfo".to_string();
    let redis_conn = redis_conn(&config).await;
    let http_client = Arc::new(HttpManager::new(
        "https://api.jup.ag".to_string(),
        50,
        RetryConfig::default(),
        None,
        &config.jupiter_api_key,
    ));

    let state = Arc::new(AppState::new());

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let router: Router = build_router(exchange_binance_url, http_client, state.clone()).await?;
    let url = build_ws_url(state.clone()).await?;

    let redis_for_ws = redis_conn.clone();
    tokio::spawn(async move {
        run_binance_ws_client(url, redis_for_ws).await;
    });

    let addr = config.price_service_socket_addr();
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    tracing::info!("Starting server on {}", addr);
    axum::serve(listener, router).await.unwrap();

    Ok(())
}
