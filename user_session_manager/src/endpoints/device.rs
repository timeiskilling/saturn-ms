use std::sync::Arc;

use axum::Json;

use crate::app_state::AppState;
use crate::endpoints::errors::ApiError;
use crate::middleware::session_token::AuthenticatedUser;
use crate::redis::command::{disconnect_device, get_devices};
use crate::redis::extractor::RedisConn;
use crate::redis::models::DeviceSession;
use axum::extract::Path;

#[axum::debug_handler(state = Arc<AppState>)]
pub async fn connected_devices(
    user: AuthenticatedUser,
    mut redis: RedisConn,
) -> Result<Json<Vec<DeviceSession>>, ApiError> {
    let devices = get_devices(&user.wallet_address, &mut redis.0).await?;
    Ok(Json(devices))
}

pub async fn disconnect_target_device(
    _user: AuthenticatedUser,
    mut redis: RedisConn,
    Path(public_id): Path<String>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    disconnect_device(&public_id, &mut redis.0).await?;
    Ok(axum::http::StatusCode::OK)
}
