use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};

use saturn_errors::error::UserServiceError;
use std::sync::Arc;

use crate::{app_state::AppState, endpoints::errors::ApiError};

pub struct DatabaseConnection(pub sqlx::pool::PoolConnection<sqlx::Postgres>);

impl<S> FromRequestParts<S> for DatabaseConnection
where
    S: Send + Sync,
    Arc<AppState>: axum::extract::FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let conn = app_state
            .db()
            .acquire()
            .await
            .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

        Ok(Self(conn))
    }
}
