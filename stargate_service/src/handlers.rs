use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{
    api::{chains::ChainsResponse, quote::QuotesRequest, stargate_client::StargateClient, tokens::{TokensRequest, TokensResponse}},
    error::SaturnError,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ResponseByQuote {
    pub transactions: Vec<String>,
    pub price: (String, String),
}

pub async fn token_exchange(
    State(state): State<Arc<StargateClient>>,
    Json(token_request): Json<TokensRequest>,
) -> Result<Json<TokensResponse>, SaturnError> {
    let response = state.get_token_exchange(token_request).await;
    match response {
        Ok(response_data) => Ok(Json(response_data)),
        Err(e) => Err(SaturnError::InternalServerError(e.to_string())),
    }
}

pub async fn chains_supported(
    State(state): State<Arc<StargateClient>>,
) -> Result<Json<ChainsResponse>, SaturnError> {
    let response = state.get_chains_supported().await;
    match response {
        Ok(response_data) => Ok(Json(response_data)),
        Err(e) => Err(SaturnError::InternalServerError(e.to_string())),
    }
}

pub async fn get_quote(
    State(state): State<Arc<StargateClient>>,
    Json(quote_request): Json<QuotesRequest>,
) -> Result<Json<ResponseByQuote>, SaturnError> {
    tracing::debug!("API V1 get_quote request: {:?}", quote_request);
    let task = tokio::spawn(async move { state.get_quote_transaction(quote_request).await });
    match task.await {
        Ok(result_from_function) => match result_from_function {
            Ok(response_data) => Ok(Json(response_data)),
            Err(e) => Err(SaturnError::InternalServerError(e.to_string())),
        },
        Err(join_error) => {
            tracing::error!("Task panicked: {}", join_error);
            Err(SaturnError::from(join_error))
        }
    }
}
