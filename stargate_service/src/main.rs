use tracing_subscriber::fmt::format::FmtSpan;

use crate::api::tokens::{TokensRequest, TokensResponse};

mod api;
mod handlers;
mod error;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let client = reqwest::Client::builder().build().unwrap();

    let params = TokensRequest {
        src_token: Some("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v".to_string()),
        src_chain_key: Some("solana".to_string()),
        dst_chain_key: Some("ethereum".to_string()),
    };
    let response = client
        .get("https://stargate.finance/api/v1/tokens")
        .query(&params)
        .send()
        .await
        .unwrap();

    let tokens_response: TokensResponse = response.json().await.unwrap();
    println!("Response: {:#?}", tokens_response);
}
