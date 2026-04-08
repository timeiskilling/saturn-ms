use axum::{Json, response::IntoResponse};
use axum_extra::{TypedHeader, headers::UserAgent};
use saturn_errors::error::UserServiceError;

use crate::{
    auth_manager::{inject_token::inject_token, signature_check::Verifiable},
    endpoints::{
        errors::ApiError,
        models::{NonceResponse, SolVerifyRequest},
    },
    middleware::session_token::AuthenticatedUser,
    postgres::{extractor::DatabaseConnection, query::insert_wallets},
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
    existing_session: Option<AuthenticatedUser>,
    db: DatabaseConnection,
    mut redis: RedisConn,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.request_id).await?;
    let _ = redis::command::delete_nonce_from_redis(&mut redis.0, &payload.request_id).await;
    let expected_message = format!("Sign in to Saturn.\n\nNonce: {}", expected_nonce);
    let public_key = payload.public_key.clone();
    let signature = payload.try_into_domain(expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    match existing_session {
        Some(user) => {
            tracing::info!(
                "User {} is linking a new wallet: {}",
                user.wallet_address,
                public_key
            );
            let success_response = insert_wallets(db, user, public_key).await?;
            Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
        }
        None => {
            tracing::info!("New login for wallet: {}", public_key);
            let response = inject_token(public_key, &mut redis.0, user_agent.as_str()).await?;
            Ok(response.into_response())
        }
    }
}
