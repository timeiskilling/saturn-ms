use std::sync::Arc;

use axum::Json;

use crate::{
    app_state::AppState,
    endpoints::{
        errors::ApiError,
        models::{HistoryTransactionRequest, TransactionHistoryRecord},
    },
    middleware::session_token::AuthenticatedUser,
    postgres::{extractor::DbPool, query},
};

#[axum::debug_handler(state = Arc<AppState>)]
pub async fn record_transaction(
    existing_session: AuthenticatedUser,
    db: DbPool,
    Json(payload): Json<HistoryTransactionRequest>,
) -> Result<Json<TransactionHistoryRecord>, ApiError> {
    let respone =
        query::history_transaction(payload, &db.0, existing_session.wallet_address).await?;
    Ok(Json(respone))
}
