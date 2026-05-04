use std::sync::Arc;

use axum::{Json, response::IntoResponse};
use axum_extra::{TypedHeader, headers::UserAgent};
use saturn_errors::error::UserServiceError;

use crate::{
    app_state::AppState,
    auth_manager::{inject_token::inject_token, signature_check::Verifiable},
    endpoints::{
        errors::ApiError,
        models::{
            DeleteAccountRequest, NonceResponse, PromoteWalletRequest, SolVerifyRequest,
            TargetPayload,
        },
    },
    middleware::session_token::AuthenticatedUser,
    postgres::{
        extractor::DatabaseConnection,
        models::UnlinkedWalletResponse,
        query::{insert_wallets, unlink_wallet},
    },
    redis::{self, extractor::RedisConn},
};

pub async fn get_nonce(mut redis: RedisConn) -> Result<Json<NonceResponse>, ApiError> {
    let resp = redis::command::write_get_nonce_to_redis(&mut redis.0).await?;
    let response = NonceResponse {
        nonce: resp.nonce.clone(),
        request_id: resp.request_id,
        message_template: format!("Sign in to Saturn.\n\nNonce: {}", resp.nonce),
    };
    Ok(Json(response))
}

#[axum::debug_handler(state = Arc<AppState>)]
pub async fn verify_signature(
    existing_session: Option<AuthenticatedUser>,
    mut db: DatabaseConnection,
    mut redis: RedisConn,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.verify_data.request_id)
            .await?;
    let _ = redis::command::delete_nonce_from_redis(&mut redis.0, &payload.verify_data.request_id)
        .await;
    let expected_message = format!("Sign in to Saturn.\n\nNonce: {}", expected_nonce);
    let public_key = payload.verify_data.public_key.clone();

    let signature = payload
        .verify_data
        .try_into_domain(expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    match existing_session {
        Some(user) => {
            let is_primary =
                crate::postgres::query::check_if_is_primary_wallet(&mut db, &public_key).await?;

            let hashed_public_key = crate::hash::hash_wallet_address(&public_key);

            if is_primary && user.wallet_address != hashed_public_key {
                tracing::warn!(
                    "Rejected linking wallet {}. Already registered as a primary account.",
                    public_key
                );
                return Err(ApiError(UserServiceError::Unauthorized));
            }

            let is_linked_to_primary =
                crate::postgres::query::check_if_is_linked_wallet(&mut db, &public_key).await?;

            if let Some(primary_wallet) = is_linked_to_primary
                && primary_wallet != user.wallet_address
            {
                tracing::warn!(
                    "Rejected linking wallet {}. Already linked to {}.",
                    public_key,
                    primary_wallet
                );
                return Err(ApiError(UserServiceError::Unauthorized));
            }
            tracing::info!(
                "User {} is linking a new wallet: {}",
                user.wallet_address,
                public_key
            );
            let success_response = insert_wallets(
                db,
                user,
                public_key,
                payload.wallet_id,
                payload.name,
                payload.address_type,
            )
            .await?;
            Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
        }
        None => {
            let is_linked_to_primary =
                crate::postgres::query::check_if_is_linked_wallet(&mut db, &public_key).await?;

            if let Some(primary_wallet) = is_linked_to_primary {
                tracing::warn!(
                    "Rejected login for linked wallet {}. Belongs to primary {}.",
                    public_key,
                    primary_wallet
                );
                return Err(ApiError(UserServiceError::Unauthorized));
            }

            tracing::info!("New login for wallet: {}", public_key);
            let response = inject_token(public_key, &mut redis.0, user_agent.as_str()).await?;
            Ok(response.into_response())
        }
    }
}

pub async fn verify_unlink(
    mut redis: RedisConn,
    mut db: DatabaseConnection,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.verify_data.request_id)
            .await?;
    let _ = redis::command::delete_nonce_from_redis(&mut redis.0, &payload.verify_data.request_id)
        .await;
    let public_key = payload.verify_data.public_key.clone();

    tracing::info!("Call Verify unlink for wallet {}", public_key);

    let is_linked_to_primary =
        crate::postgres::query::check_if_is_linked_wallet(&mut db, &public_key).await?;

    if is_linked_to_primary.is_none() {
        tracing::warn!(
            "Rejected unlink: Wallet is not linked to primary wallet {}.",
            public_key,
        );

        return Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not linked to this primary account".to_string(),
        )));
    }

    let expected_message = format!("Unlink from any primary account. Nonce: {}", expected_nonce);
    let signature = payload
        .verify_data
        .try_into_domain(expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    let response = unlink_wallet(db, public_key).await?;
    Ok((axum::http::StatusCode::OK, Json(response)).into_response())
}

pub async fn logout(
    mut redis: RedisConn,
    jar: axum_extra::extract::cookie::CookieJar,
) -> Result<impl IntoResponse, ApiError> {
    if let Some(cookie) = jar.get("saturn_session") {
        let _ = redis::command::delete_session(cookie.value(), &mut redis.0).await;
    }

    let mut removal_cookie = axum_extra::extract::cookie::Cookie::build(("saturn_session", ""))
        .path("/")
        .build();
    removal_cookie.make_removal();

    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        axum::http::header::SET_COOKIE,
        removal_cookie.to_string().parse().unwrap(),
    );

    tracing::info!("Delete session Logout wallet");

    Ok((headers, axum::http::StatusCode::OK).into_response())
}

pub async fn promote_wallet(
    user: AuthenticatedUser,
    db: DatabaseConnection,
    mut redis: RedisConn,
    Json(payload): Json<PromoteWalletRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.request_id).await?;
    let _ = redis::command::delete_nonce_from_redis(&mut redis.0, &payload.request_id).await;

    tracing::info!("Promote wallet {}", payload.target_wallet);

    let expected_message = format!(
        "Promote wallet {}. Nonce: {}",
        payload.target_wallet, expected_nonce
    );

    let signature = payload
        .verify_data
        .try_into_domain(&user.wallet_address, expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    let success_response = crate::postgres::query::promote_wallet(
        db,
        user.clone(),
        payload.target_wallet,
        payload.wallet_id,
        payload.name,
        payload.address_type,
    )
    .await?;

    let _ = redis::command::delete_all_user_sessions(&user.wallet_address, &mut redis.0).await;

    Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
}

pub async fn delete_account(
    user: AuthenticatedUser,
    db: DatabaseConnection,
    mut redis: RedisConn,
    Json(payload): Json<DeleteAccountRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut redis.0, &payload.request_id).await?;
    let _ = redis::command::delete_nonce_from_redis(&mut redis.0, &payload.request_id).await;

    tracing::info!("Delete account for wallet {}", user.wallet_address);

    let expected_message = format!("Delete account. Nonce: {}", expected_nonce);
    let signature = payload.try_into_domain(&user.wallet_address, expected_message.into_bytes())?;

    let _ = signature
        .verify()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    let success_response = crate::postgres::query::delete_account(db, user.clone()).await?;

    let _ = redis::command::delete_all_user_sessions(&user.wallet_address, &mut redis.0).await;

    Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
}

pub async fn disconnect_wallet_handler(
    user: crate::middleware::session_token::AuthenticatedUser,
    db: crate::postgres::extractor::DatabaseConnection,
    payload: axum::Json<TargetPayload>,
) -> Result<axum::Json<UnlinkedWalletResponse>, crate::endpoints::errors::ApiError> {
    tracing::info!("Disconnect linked wallet {}", payload.target_wallet);

    let res = crate::postgres::query::disconnect_wallet(user, db, payload).await?;
    Ok(axum::Json(res))
}
