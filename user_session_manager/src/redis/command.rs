use deadpool_redis::sentinel::Connection;
use redis::AsyncCommands;
use saturn_errors::error::UserServiceError;

use crate::auth_manager::nonce::generate_nonce;

pub struct NonceResponse {
    pub nonce: String,
    pub request_id: String,
}

pub async fn fetch_nonce_from_redis(
    conn: &mut Connection,
    request_id: &str,
) -> Result<String, UserServiceError> {
    let redis_key = format!("auth_nonce:{}", request_id);
    let nonce: Option<String> = conn
        .get(redis_key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;
    nonce.ok_or(UserServiceError::InvalidNonce)
}

pub async fn write_get_nonce_to_redis(
    conn: &mut Connection,
) -> Result<NonceResponse, UserServiceError> {
    let request_id = uuid::Uuid::new_v4().to_string();
    let raw_nonce = generate_nonce();
    let nonce_string = bs58::encode(raw_nonce).into_string();

    let redis_key = format!("auth_nonce:{}", request_id);
    conn.set_ex::<_, _, ()>(redis_key, &nonce_string, 300)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    Ok(NonceResponse {
        nonce: nonce_string,
        request_id,
    })
}
