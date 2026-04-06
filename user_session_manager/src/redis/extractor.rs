use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use deadpool_redis::sentinel::Connection;
use saturn_errors::error::UserServiceError;
use std::sync::Arc;

use crate::{app_state::AppState, endpoints::errors::ApiError};

pub struct RedisConn(pub Connection);

impl<S> FromRequestParts<S> for RedisConn
where
    S: Send + Sync,
    Arc<AppState>: axum::extract::FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let conn = app_state
            .get_redis_connection()
            .await
            .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

        Ok(RedisConn(conn))
    }
}
