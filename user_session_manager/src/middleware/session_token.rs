use axum::extract::FromRef;
use axum::{extract::FromRequestParts, http::request::Parts};
use axum_extra::extract::cookie::CookieJar;
use deadpool_redis::redis::AsyncCommands;
use std::sync::Arc;

use crate::app_state::AppState;
use crate::endpoints::errors::ApiError;
use saturn_errors::error::UserServiceError;

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

        let wallet_address: Option<String> = redis_conn
            .get(&redis_key)
            .await
            .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

        match wallet_address {
            Some(address) => Ok(AuthenticatedUser {
                wallet_address: address,
            }),
            None => Err(ApiError(UserServiceError::SessionExpired)),
        }
    }
}
