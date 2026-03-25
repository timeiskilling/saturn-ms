use std::sync::Arc;

use axum::{Json, extract::State};
use common::models::TokenInfo;
use reqwest::StatusCode;

use crate::build::AppState;

pub async fn token_list_handler(
    _: crate::api_extracter::Client,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<TokenInfo>>, StatusCode> {
    let tokens = state.cached_tokens.read().await.clone();

    Ok(Json(tokens))
}
