use axum::Json;
use reqwest::StatusCode;
use saturn_errors::error::UserServiceError;

use crate::{
    auth_manager::signature_check::Verifiable,
    endpoints::models::{NonceResponse, SolVerifyRequest},
    redis::{self, extractor::RedisConn},
};

pub async fn get_nonce(mut redis: RedisConn) -> Result<Json<NonceResponse>, UserServiceError> {
    let resp = redis::command::write_get_nonce_to_redis(&mut redis.0).await?;
    let response = NonceResponse {
        nonce: resp.nonce.clone(),
        request_id: resp.request_id,
        message_template: format!("Sign in to Saturn.\n\nNonce: {}", resp.nonce),
    };
    Ok(Json(response))
}

pub async fn verify_signature(
    mut redis: RedisConn,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<StatusCode, UserServiceError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.request_id).await?;
    let expected_message = format!("Sign in to Saturn.\n\nNonce: {}", expected_nonce);
    let signature = payload.try_into_domain(expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    Ok(StatusCode::OK)
}
