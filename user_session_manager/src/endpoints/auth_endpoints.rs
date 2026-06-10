use std::sync::Arc;

use axum::{Json, response::IntoResponse};
use axum_extra::{TypedHeader, headers::UserAgent};
use saturn_errors::error::UserServiceError;

use crate::{
    app_state::AppState,
    auth_manager::{inject_token::inject_token, signature_check::verify_payload_signature},
    endpoints::{
        errors::ApiError,
        models::{
            NonceResponse, PromoteWalletRequest, SolVerifyRequest, TargetPayload, VerifySignature,
        },
    },
    middleware::session_token::AuthenticatedUser,
    postgres::{
        extractor::DbPool,
        models::UnlinkedWalletResponse,
        query::{
            LoginEligibility, acquire_login_lock_and_check, ensure_that_user_exists,
            get_wallet_status, insert_wallets, unlink_wallet,
        },
    },
    redis::{self, extractor::RedisConn},
};

pub async fn get_nonce(redis: RedisConn) -> Result<Json<NonceResponse>, ApiError> {
    let mut conn = redis.get_connection().await.map_err(|e| {
        tracing::error!("Failed to acquire Redis connection: {:?}", e);
        e
    })?;

    let resp = redis::command::write_get_nonce_to_redis(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Failed to write nonce to Redis: {:?}", e);
            e
        })?;

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
    db: DbPool,
    redis: RedisConn,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let mut conn = redis.get_connection().await?;
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut conn, &payload.verify_data.request_id).await?;
    let expected_message = format!("Sign in to Saturn.\n\nNonce: {}", expected_nonce);
    let hashed_public_key = crate::hash::hash_wallet_address(&payload.verify_data.public_key);

    drop(conn);
    verify_payload_signature(payload.verify_data, expected_message, None).await?;

    match existing_session {
        Some(user) => {
            let wallet_status = get_wallet_status(&db.0, &hashed_public_key).await?;

            if wallet_status.is_primary && user.wallet_address != hashed_public_key {
                tracing::warn!("Rejected linking wallet. Already registered as a primary account.",);
                return Err(ApiError(UserServiceError::Unauthorized));
            }

            if wallet_status.linked_to.is_some() {
                tracing::warn!("Rejected linking wallet. Already linked.");
                return Err(ApiError(UserServiceError::Unauthorized));
            }

            tracing::info!("User {} is linking a new wallet", user.wallet_address,);

            let success_response = insert_wallets(
                &db.0,
                user,
                hashed_public_key,
                payload.wallet_id,
                payload.name,
                payload.address_type,
            )
            .await?;
            Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
        }
        None => {
            let eligibility = acquire_login_lock_and_check(&db.0, &hashed_public_key).await?;

            match eligibility {
                LoginEligibility::IsLinked => {
                    tracing::warn!("Rejected login for linked wallet. Belongs to primary.");
                    Err(ApiError(UserServiceError::Unauthorized))
                }
                LoginEligibility::FreeWallet | LoginEligibility::IsPrimary => {
                    tracing::info!("Login approved for wallet");

                    ensure_that_user_exists(hashed_public_key.clone(), &db.0).await?;

                    let mut cleanup_conn = redis.get_connection().await?;
                    let response =
                        inject_token(hashed_public_key, &mut cleanup_conn, user_agent.as_str())
                            .await?;
                    Ok(response.into_response())
                }
            }
        }
    }
}

pub async fn verify_unlink(
    redis: RedisConn,
    db: DbPool,
    Json(payload): Json<SolVerifyRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let mut conn = redis.get_connection().await?;
    let hashed_public_key = crate::hash::hash_wallet_address(&payload.verify_data.public_key);

    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut conn, &payload.verify_data.request_id).await?;

    drop(conn);

    let expected_message = format!("Unlink from any primary account. Nonce: {}", expected_nonce);
    verify_payload_signature(payload.verify_data, expected_message, None).await?;

    unlink_wallet(db, hashed_public_key).await
}

pub async fn logout(
    redis: RedisConn,
    jar: axum_extra::extract::cookie::CookieJar,
) -> Result<impl IntoResponse, ApiError> {
    if let Some(cookie) = jar.get("saturn_session") {
        let mut conn = redis.get_connection().await?;
        let _ = redis::command::delete_session(cookie.value(), &mut conn).await;
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
    existing_session: AuthenticatedUser,
    db: DbPool,
    redis: RedisConn,
    Json(payload): Json<PromoteWalletRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let mut conn = redis.get_connection().await?;
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut conn, &payload.verify_data.request_id).await?;

    tracing::info!("Promote wallet {}", payload.target_wallet);

    drop(conn);
    let expected_message = format!(
        "Promote wallet {}. Nonce: {}",
        payload.target_wallet, expected_nonce
    );

    verify_payload_signature(
        payload.verify_data,
        expected_message,
        Some(&existing_session.wallet_address),
    )
    .await?;

    let success_response = crate::postgres::query::promote_wallet(
        &db.0,
        existing_session.clone(),
        payload.target_wallet,
        payload.wallet_id,
        payload.name,
        payload.address_type,
    )
    .await?;

    let mut cleanup_conn = redis.get_connection().await?;
    let _ = redis::command::delete_all_user_sessions(
        &existing_session.wallet_address,
        &mut cleanup_conn,
    )
    .await;

    Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
}

pub async fn delete_account(
    existing_session: AuthenticatedUser,
    db: DbPool,
    redis: RedisConn,
    Json(payload): Json<VerifySignature>,
) -> Result<impl IntoResponse, ApiError> {
    let mut conn = redis.get_connection().await?;
    let expected_nonce =
        redis::command::fetch_nonce_from_redis(&mut conn, &payload.request_id).await?;

    tracing::info!(
        "Delete account for wallet {}",
        existing_session.wallet_address
    );
    drop(conn);
    let expected_message = format!("Delete account. Nonce: {}", expected_nonce);

    verify_payload_signature(
        payload,
        expected_message,
        Some(&existing_session.wallet_address),
    )
    .await?;

    let success_response =
        crate::postgres::query::delete_account(&db.0, &existing_session.wallet_address).await?;

    let mut cleanup_conn = redis.get_connection().await?;
    let _ = redis::command::delete_all_user_sessions(
        &existing_session.wallet_address,
        &mut cleanup_conn,
    )
    .await;

    Ok((axum::http::StatusCode::OK, Json(success_response)).into_response())
}

pub async fn disconnect_wallet_handler(
    user: crate::middleware::session_token::AuthenticatedUser,
    db: DbPool,
    payload: axum::Json<TargetPayload>,
) -> Result<axum::Json<UnlinkedWalletResponse>, crate::endpoints::errors::ApiError> {
    tracing::info!("Disconnect linked wallet {}", payload.target_wallet);

    let res = crate::postgres::query::disconnect_wallet(user, &db.0, payload).await?;
    Ok(axum::Json(res))
}
