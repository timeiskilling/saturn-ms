use bs58;
use deadpool_redis::sentinel::Connection;
use rand::prelude::*;

use redis::AsyncCommands;
use saturn_errors::error::UserServiceError;

pub async fn create_session(
    pub_key: &str,
    redis_client: &mut Connection,
) -> Result<String, UserServiceError> {
    let mut rng = rand::rng();
    let mut token_bytes = [0u8; 32];
    rng.fill_bytes(&mut token_bytes);
    let token = bs58::encode(token_bytes).into_string();
    let key = format!("session:{}", token);

    redis_client
        .set_ex::<_, _, ()>(key, pub_key, 604800)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    Ok(token)
}
