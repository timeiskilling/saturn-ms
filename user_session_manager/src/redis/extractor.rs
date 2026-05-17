use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use saturn_errors::error::UserServiceError;
use std::sync::Arc;

use crate::{app_state::AppState, endpoints::errors::ApiError};

pub struct RedisConn(pub deadpool_redis::sentinel::Pool);

impl RedisConn {
    pub async fn get_connection(&self) -> Result<deadpool_redis::sentinel::Connection, ApiError> {
        self.0
            .get()
            .await
            .map_err(|e| ApiError(UserServiceError::RedisError(e.to_string())))
    }
}

impl<S> FromRequestParts<S> for RedisConn
where
    S: Send + Sync,
    Arc<AppState>: axum::extract::FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let conn = app_state.redis_pool().clone();
        Ok(RedisConn(conn))
    }
}
