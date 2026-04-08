use saturn_errors::error::UserServiceError;
use sqlx::types::Json;

use crate::endpoints::errors::ApiError;
use crate::middleware::session_token::AuthenticatedUser;
use crate::redis::command::get_devices;
use crate::redis::extractor::RedisConn;
use crate::redis::models::DeviceSession;

pub async fn connected_devices(
    user: AuthenticatedUser,
    mut redis: RedisConn,
) -> Result<Json<Vec<DeviceSession>>, ApiError> {
    let devices = get_devices(&user.wallet_address, &mut redis.0).await?;
    Ok(Json(devices))
}
