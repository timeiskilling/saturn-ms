// use std::sync::Arc;
// use crate::app_state::AppState;
use crate::endpoints::errors::ApiError;
use crate::middleware::session_token::AuthenticatedUser;
use crate::redis::command::{disconnect_device, get_devices};
use crate::redis::extractor::RedisConn;
use crate::redis::models::DeviceSession;
use axum::Json;
use axum::extract::Path;

// #[axum::debug_handler(state = Arc<AppState>)]
pub async fn connected_devices(
    user: AuthenticatedUser,
    redis: RedisConn,
) -> Result<Json<Vec<DeviceSession>>, ApiError> {
    let devices = get_devices(&user.wallet_address, &mut redis.get_connection().await?).await?;
    Ok(Json(devices))
}

pub async fn disconnect_target_device(
    _user: AuthenticatedUser,
    redis: RedisConn,
    Path(public_id): Path<String>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    disconnect_device(&public_id, &mut redis.get_connection().await?).await?;
    Ok(axum::http::StatusCode::OK)
}
