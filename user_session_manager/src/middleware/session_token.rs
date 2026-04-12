use axum::extract::{FromRef, FromRequestParts};
use axum::{extract::OptionalFromRequestParts, http::request::Parts};
use axum_extra::extract::cookie::CookieJar;
use deadpool_redis::redis::AsyncCommands;
use saturn_errors::error::UserServiceError;
use std::sync::Arc;

use crate::app_state::AppState;
use crate::endpoints::errors::ApiError;
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub wallet_address: String,
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let jar = CookieJar::from_headers(&parts.headers);

        let session_cookie = jar
            .get("saturn_session")
            .ok_or(UserServiceError::Unauthorized)?;

        let token = session_cookie.value();

        let mut redis_conn = app_state
            .get_redis_connection()
            .await
            .map_err(|e| UserServiceError::RedisError(e.to_string()))?;
        let redis_key = format!("session:{}", token);

        let session_data: Option<String> = redis_conn
            .get(&redis_key)
            .await
            .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

        match session_data {
            Some(data) => {
                let parsed: serde_json::Value = serde_json::from_str(&data)
                    .map_err(|_| ApiError(UserServiceError::SessionExpired))?;
                let address = parsed["wallet"]
                    .as_str()
                    .ok_or(ApiError(UserServiceError::SessionExpired))?
                    .to_string();

                Ok(AuthenticatedUser {
                    wallet_address: address,
                })
            }
            None => Err(ApiError(UserServiceError::SessionExpired)),
        }
    }
}

impl<S> OptionalFromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Option<Self>, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);
        let jar = CookieJar::from_headers(&parts.headers);

        let session_cookie = match jar.get("saturn_session") {
            Some(cookie) => cookie,
            None => return Ok(None),
        };

        let token = session_cookie.value();

        let mut redis_conn = app_state
            .get_redis_connection()
            .await
            .map_err(|e| ApiError(UserServiceError::RedisError(e.to_string())))?;

        let redis_key = format!("session:{}", token);

        let session_data: Option<String> = redis_conn
            .get(&redis_key)
            .await
            .map_err(|e| ApiError(UserServiceError::RedisError(e.to_string())))?;

        match session_data {
            Some(data) => {
                let parsed: serde_json::Value = serde_json::from_str(&data)
                    .map_err(|_| ApiError(UserServiceError::SessionExpired))?;
                let address = parsed["wallet"]
                    .as_str()
                    .ok_or(ApiError(UserServiceError::SessionExpired))?
                    .to_string();

                Ok(Some(AuthenticatedUser {
                    wallet_address: address,
                }))
            }
            None => Ok(None),
        }
    }
}
