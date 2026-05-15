use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};

use std::sync::Arc;

use crate::{app_state::AppState, endpoints::errors::ApiError};

pub struct DbPool(pub sqlx::PgPool);

impl<S> FromRequestParts<S> for DbPool
where
    S: Send + Sync,
    Arc<AppState>: axum::extract::FromRef<S>,
{
    type Rejection = ApiError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let pool = app_state.db().clone();
        Ok(Self(pool))
    }
}
