use std::sync::Arc;

use axum::{Router, routing::post};
use tower_http::cors::{self, CorsLayer};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::api::{
    quote::QuotesRequest,
    stargate_client::StargateClient,
    tokens::{TokensRequest, TokensResponse},
};

mod api;
mod error;
mod handlers;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let cors_layer = CorsLayer::new()
        .allow_origin(cors::Any)
        .allow_headers(cors::Any)
        .allow_methods(cors::Any);

    // let client = reqwest::Client::builder().build().unwrap();

    // let params = TokensRequest {
    //     src_token: Some("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v".to_string()),
    //     src_chain_key: Some("solana".to_string()),
    //     dst_chain_key: Some("ethereum".to_string()),
    // };
    // let response = client
    //     .get("https://stargate.finance/api/v1/tokens")
    //     .query(&params)
    //     .send()
    //     .await
    //     .unwrap();

    // let tokens_response: TokensResponse = response.json().await.unwrap();
    // println!("Response: {:#?}", tokens_response);

    let strg_client = Arc::new(StargateClient::new());

    // let ethereum_to_solana = QuotesRequest {
    //     src_token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".to_string(), // USDC на Ethereum
    //     dst_token: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359".to_string(), // USDC на Solana
    //     src_address: "0x1504482b4D3E5ec88acc21bdBE0e8632d8408840".to_string(),
    //     dst_address: "0x1504482b4D3E5ec88acc21bdBE0e8632d8408840".to_string(),
    //     src_chain_key: "ethereum".to_string(),
    //     dst_chain_key: "polygon".to_string(),
    //     src_amount: "1000000".to_string(), // 50 USDC (6 decimals на Ethereum)
    //     dst_amount_min: "990000".to_string(), // Мінімум 49.5 USDC
    // };

    // let test1 = str_client.get_quote_transaction(ethereum_to_solana).await?;
    // println!("{:#?}",test1);

    let router = Router::new()
        .route("/api_v1/quote", post(handlers::get_quote))
        .route("/api_v1/tokens", post(handlers::token_exchange))
        .route("/api_v1/chains", post(handlers::chains_supported))
        .layer(cors_layer)
        .with_state(Arc::clone(&strg_client));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, router).await.unwrap();
}
// https://stargate.finance/bridge?
// srcChain=ethereum&
// srcToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&
// dstChain=base&dstToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
